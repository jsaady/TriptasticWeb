import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, Res } from '@nestjs/common';
import { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { Request, Response } from 'express';
import { MFA_ENABLED } from '../../utils/config/config.js';
import { User as UserEntity } from '../users/users.entity.js';
import { UserService } from '../users/users.service.js';
import { AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { AuthTokenContents, RegisterUserDTO, ResetPasswordDTO, VerifyEmailDTO } from './auth.dto.js';
import { AuthService } from './auth.service.js';
import { IsAuthenticated } from './isAuthenticated.guard.js';
import { User } from './user.decorator.js';
import { WebAuthnService } from './webAuthn.service.js';

@Controller('/auth')
export class AuthController {
  constructor (
    private authService: AuthService,
    private webAuthnService: WebAuthnService,
    private userService: UserService
  ) { }

  @Post('/login')
  async login(@Body() { email, password, clientIdentifier }: {email: string, password: string; clientIdentifier: string;}, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.loginUser(email, password);

    return await this.processUserLogin(user, response, clientIdentifier, null);
  }


  @Post('/reset-password')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async resetPassword(@User() { email, clientIdentifier }: AuthTokenContents, @Res({ passthrough: true }) response: Response, @Body() { currentPassword, password }: ResetPasswordDTO) {
    const updatedUser = await this.authService.resetPasswordForUser(email, currentPassword, password);
    return this.processUserLogin(updatedUser, response, clientIdentifier, null);
  }

  @Post('/send-verification-email')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async sendVerificationEmail(@User() { sub }: AuthTokenContents, @Body() {force = false}: {force?: boolean}, @Res({ passthrough: true }) response: Response) {
    await this.authService.initiateEmailVerification(sub, force);

    return { success: true };
  }

  @Post('/verify-email')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async verifyEmail(@User() { sub , clientIdentifier}: AuthTokenContents, @Res({ passthrough: true }) response: Response, @Body() { token }: VerifyEmailDTO) {
    const updatedUser = await this.authService.validateEmailToken(sub, token);
    return this.processUserLogin(updatedUser, response, clientIdentifier, 'email');
  }

  @Post('/register')
  async register(@Body() { email, password, clientIdentifier }: RegisterUserDTO, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.registerUser({ email, password, clientIdentifier });

    return await this.processUserLogin(user, response, clientIdentifier, null);
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('Authorization');

    return {};
  }

  @Get('/check')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async checkAuth(@User() token: AuthTokenContents, @Res({ passthrough: true }) response: Response) {
    const user = await this.userService.getUserById(token.sub);

    return await this.processUserLogin(user, response, token.clientIdentifier, token.mfaMethod);
  }

  @Post('web-authn/start-registration')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async startRegistration(@User() { sub }: AuthTokenContents) {
    return this.webAuthnService.startWebAuthnRegistration(sub);
  }
  
  @Post('web-authn/verify-registration')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async verifyRegistration(@User() { sub, clientIdentifier }: AuthTokenContents, @Body() {attn, name}: {attn: RegistrationResponseJSON; name: string;}, @Res({ passthrough: true }) response: Response) {
    const { verified, user } = await this.webAuthnService.verifyWebAuthnRegistration(sub, name, attn);

    if (!verified) throw new BadRequestException();

    return this.processUserLogin(user, response, clientIdentifier, 'webauthn');
  }

  @Post('web-authn/login-start')
  @IsAuthenticated({ allowNoMFA: true })
  async startLogin(@User() { sub }: AuthTokenContents) {
    return this.webAuthnService.startWebAuthn(sub);
  }

  @Post('web-authn/verify-login')
  @IsAuthenticated({ allowNoMFA: true })
  async verifyLogin(@User() { sub, clientIdentifier }: AuthTokenContents, @Body() body: AuthenticationResponseJSON, @Res({ passthrough: true }) response: Response) {
    const {verified, user} = await this.webAuthnService.verifyWebAuthn(sub, body);

    if (!verified) throw new BadRequestException();

    return this.processUserLogin(user, response, clientIdentifier, 'webauthn');
  }

  @Get('web-authn/devices')
  @IsAuthenticated()
  async getMyDevices(@User() { sub }: AuthTokenContents) {
    return this.webAuthnService.getDevicesByUserId(sub);
  }

  @Delete('web-authn/devices/:id')
  @IsAuthenticated()
  async removeDevice(@Param('id') id: string, @User() { sub }: AuthTokenContents) {
    return this.webAuthnService.removeDeviceById(+id, sub);
  }

  private async processUserLogin (user: UserEntity, response: Response<any, Record<string, any>>, clientIdentifier: string, mfaMethod: string | null) {
    const existingUserDevice = await this.authService.checkUserClientIdentifier(user.id, clientIdentifier);

    if (existingUserDevice) {
      mfaMethod = 'client_identifier';
    } else if (mfaMethod && MFA_ENABLED) {
      await this.authService.registerUserClientIdentifier(user.id, clientIdentifier);
    }

    const [token, contents] = await this.authService.mintDTOForUser(user, clientIdentifier, mfaMethod);

    response.cookie('Authorization', Buffer.from(JSON.stringify(token)).toString('base64'), {
      maxAge: AUTH_TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      signed: true
    });

    if (user.needPasswordReset) {
      return {
        success: false,
        code: 'password_reset',
        data: contents
      };
    }

    if (!user.emailConfirmed) {
      return {
        success: false,
        code: 'verify_email',
        data: contents
      };
    }

    if (!contents.mfaEnabled && MFA_ENABLED) {
      return {
        success: false,
        code: 'mfa_registration_required',
        data: contents
      }
    }

    if (!contents.mfaMethod && MFA_ENABLED) {
      return {
        success: false,
        code: 'mfa_login_required',
        data: contents
      };
    }

    return {
      success: true,
      code: '',
      data: contents
    };
  }

}
