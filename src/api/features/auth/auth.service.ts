import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';
import { compare, hash } from 'bcrypt';
import { EMAIL_VERIFICATION_EXPIRATION } from '../../utils/config/config.js';
import { ConfigService } from '../../utils/config/config.service.js';
import { EmailService } from '../email/email.service.js';
import { User } from '../users/users.entity.js';
import { UserService } from '../users/users.service.js';
import { AUTH_SALT_ROUNDS, AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { AuthDTO, AuthLoginDTO, AuthRegisterDTO, AuthRegisterDeviceDTO, AuthStartDTO, AuthStatus, AuthTokenContents } from './auth.dto.js';
import { UserClient } from './entities/userClient.entity.js';
import { WebAuthnService } from './webAuthn.service.js';

@Injectable()
export class AuthService {
  constructor (
    private jwt: JwtService,
    private userService: UserService,
    private emailService: EmailService,
    private webAuthnService: WebAuthnService,
    private config: ConfigService,
    @InjectRepository(UserClient) private userClientRepo: EntityRepository<UserClient>
  ) { }

  async start (username: string, registerDevice?: boolean): Promise<AuthStartDTO> {
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      const newUser = await this.userService.createUser({
        username,
        email: '',
        isAdmin: false,
        needPasswordReset: true,
        emailConfirmed: false,
        password: ''
      });

      return {
        status: AuthStatus.registerUser,
        challengeOptions: await this.webAuthnService.startWebAuthnRegistration(newUser.id)
      }
    }

    const devices = await this.webAuthnService.getDevicesByUserId(user.id);

    if (devices.length === 0) {
      return {
        status: AuthStatus.registerUser,
        challengeOptions: await this.webAuthnService.startWebAuthnRegistration(user.id)
      }
    }

    if (registerDevice) {
      return {
        status: AuthStatus.registerDevice,
        challengeOptions: await this.webAuthnService.startWebAuthnRegistration(user.id)
      };
    }

    return {
      status: AuthStatus.login,
      challengeOptions: await this.webAuthnService.startWebAuthn(user.id)
    }
  }

  async continueDeviceRegistration ({ username, response, deviceName, password }: AuthRegisterDeviceDTO): Promise<User> {
    const foundUser = await this.userService.getUserByUsername(username);

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    if (foundUser.password) {
      const passwordMatches = await this.compareValue(password, foundUser.password);
  
      if (!passwordMatches) {
        throw new BadRequestException('Incorrect password');
      }
    }

    const { verified, user } = await this.webAuthnService.verifyWebAuthnRegistration(foundUser.id, deviceName || 'default', response);

    if (!verified) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async continueRegistration (dto: AuthRegisterDTO): Promise<User> {
    const user = await this.continueDeviceRegistration(dto);

    const password = await this.hashValue(dto.password);

    await this.userService.updateUser(user, { needPasswordReset: false, password, email: dto.email, emailConfirmed: false });

    return user;
  }

  async continueLogin ({ response, username }: AuthLoginDTO): Promise<User> {
    const foundUser = await this.userService.getUserByUsername(username);

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const { verified, user } = await this.webAuthnService.verifyWebAuthn(foundUser.id, response);

    if (!verified) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  private async generateEmailVerificationToken() {
    return String(Math.ceil(Math.random() * 999999)).padStart(6, '0');
  }

  async initiateEmailVerification(userIdOrUser: number|User, force: boolean) {
    const user = typeof userIdOrUser === 'number' ? await this.userService.getUserById(userIdOrUser) : userIdOrUser;

    if (force || !user.emailTokenDate || (user.emailTokenDate.getTime() < (Date.now() - EMAIL_VERIFICATION_EXPIRATION * 1000))) {
      const token = await this.generateEmailVerificationToken();
      const hashed = await this.hashValue(token);

      await this.userService.updateUser(user, { emailToken: hashed, emailTokenDate: new Date() });
      try {
        await this.emailService.sendEmail(user.email, 'Email Verification', `Please copy the following code to verify your email: ${token}`);
      } catch (e) {
        await this.userService.updateUser(user, { emailToken: null, emailTokenDate: null });
        throw e;
      }
    }
  }

  async validateEmailToken(userId: number, token: string) {
    const user = await this.userService.getUserById(userId);
    const { emailToken, emailTokenDate } = user;

    if (!emailTokenDate || !emailToken) throw new BadRequestException('No token present');

    const diffMs = Date.now() - emailTokenDate.getTime();

    const tokenActive = diffMs < EMAIL_VERIFICATION_EXPIRATION * 1000;

    if (!tokenActive) {
      throw new BadRequestException('Token expired')
    }

    const tokenCorrect = await this.compareValue(token, emailToken);

    if (!tokenCorrect) {
      throw new BadRequestException('Incorrect token');
    }

    const updatedUser = await this.userService.updateUser(user, { emailConfirmed: true, emailToken: null, emailTokenDate: null})

    return updatedUser;
  }


  async mintDTOForUser(user: User, clientIdentifier: string, mfaMethod: string|null): Promise<[AuthDTO, AuthTokenContents]> {
    const contents: AuthTokenContents = {
      sub: user.id,
      isAdmin: user.isAdmin,
      email: user.email,
      emailConfirmed: user.emailConfirmed,
      needPasswordReset: user.needPasswordReset,
      mfaEnabled: await this.checkUserHasMFA(user),
      clientIdentifier,
      mfaMethod,
      type: 'auth'
    };
    return [{
      token: await this.jwt.signAsync(contents),
      refreshToken: 'NOT IMPLEMENTED',
      refreshTokenExpiresIn: 0
    }, contents];
  }

  async checkPasswordForUser(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      Logger.log(`User with email ${email} not found`, 'AuthService.checkPasswordForUser');
      throw new UnauthorizedException('Incorrect email or password');
    }

    const passwordMatches = await this.compareValue(password, user.password);

    if (!passwordMatches) {
      Logger.log(`User with email ${email} provided incorrect password`, 'AuthService.checkPasswordForUser');
      throw new UnauthorizedException('Incorrect email or password');
    }

    return user;
  }

  async checkUserHasMFA(user: User): Promise<boolean> {
    if (user.emailConfirmed) {
      return true;
    }

    const webAuthnDeviceCount = await this.webAuthnService.getDeviceCountByUserId(user.id);

    return webAuthnDeviceCount > 0;
  }

  private async hashValue (value: string): Promise<string> {
    return await hash(value, AUTH_SALT_ROUNDS);
  }

  private async compareValue (value: string, hashedValue: string) {
    return await compare(value, hashedValue);
  }

  async updatePasswordForUser(email: string, currentPassword: string, newPassword: string) {
    const user = await this.checkPasswordForUser(email, currentPassword);

    const hashedPassword = await this.hashValue(newPassword);

    const newUser = await this.userService.updateUser(user, { password: hashedPassword, needPasswordReset: false });

    return newUser;
  }

  async sendResetPasswordEmail (email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      Logger.log(`User with email ${email} not found`, 'AuthService.sendResetPasswordEmail');

      return;
    }

    const token = await this.generateResetPasswordToken(email);

    const emailContent = `Please click the following link to reset your password: ${this.config.getOrThrow('envUrl')}/login/reset-password?rpt=${encodeURIComponent(token)}. This link will expire in ${AUTH_TOKEN_EXPIRATION / 60} minutes.}`;

    await this.emailService.sendEmail(email, 'Password Reset', emailContent);
  }

  private async generateResetPasswordToken(
    email: string,
  ) {
    return this.jwt.signAsync({
      email,
      type: 'reset_password'
    });
  }

  private async validatePasswordResetToken(token: string) {
    const { email, type } = await this.jwt.verifyAsync(token);

    const user = await this.userService.getUserByEmail(email);

    if (!user) throw new BadRequestException('User not found');
    if (type !== 'reset_password') throw new BadRequestException('Invalid token type');

    return email;
  }

  async resetPasswordForUser(token: string, newPassword: string) {
    const email = await this.validatePasswordResetToken(token);
    const user = await this.userService.getUserByEmail(email);

    if (!user) throw new BadRequestException('User not found');

    const hashedPassword = await this.hashValue(newPassword);
    const updatedUser = await this.userService.updateUser(user, { password: hashedPassword, needPasswordReset: false });

    return updatedUser;
  }

  async loginUser(username: string, password: string) {
    const user = await this.checkPasswordForUser(username, password);

    return user;
  }

  async checkUserClientIdentifier(userId: number, clientID: string): Promise<boolean> {
    const existing = await this.userClientRepo.findOne({ user: { id: userId }, clientID });

    return !!existing;
  }

  async registerUserClientIdentifier(userId: number, clientID: string): Promise<void> {
    const newClient = this.userClientRepo.create({ user: { id: userId }, clientID });
    await this.userClientRepo.nativeInsert(newClient);
  }
}
