import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { CreateUserDTO } from '../users/users.dto.js';
import { User } from '../users/users.entity.js';
import { UserService } from '../users/users.service.js';
import { AUTH_SALT_ROUNDS } from './auth.constants.js';
import { AuthDTO, RegisterUserDTO } from './auth.dto.js';

@Injectable()
export class AuthService {
  private readonly algorithm = 'aes-256-cbc';

  constructor (
    private jwt: JwtService,
    private userService: UserService
  ) { }

  async registerUser({ email, password }: RegisterUserDTO) {
    const existingUser = await this.userService.getUserByEmail(email);

    if (existingUser) {
      const extra = `email ${email}`;
      throw new BadRequestException(`User with ${extra} already exists`);
    }

    const newUser: CreateUserDTO = {
      email,
      password: await hash(password, AUTH_SALT_ROUNDS),
      emailConfirmed: false,
      needPasswordReset: false,
      isAdmin: false
    };

    const createdUser = await this.userService.createUser(newUser);

    return this.mintDTOForUser(createdUser);
  }

  async mintDTOForUser(user: User): Promise<AuthDTO> {
    return {
      token: await this.jwt.signAsync({
        sub: user.id,
        isAdmin: user.isAdmin,
        email: user.email,
        emailConfirmed: user.emailConfirmed,
        needPasswordReset: user.needPasswordReset
      }),
      refreshToken: 'NOT IMPLEMENTED',
      refreshTokenExpiresIn: 0
    };
  }

  async checkPasswordForUser(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await compare(password, user?.password);

    if (!passwordMatches) throw new UnauthorizedException('Incorrect password');

    return user;
  }

  async loginUser(username: string, password: string) {
    const user = await this.checkPasswordForUser(username, password);

    return this.mintDTOForUser(user);
  }
}