import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cipher, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { UserService } from '../users/users.service.js';
import { compare, hash } from 'bcrypt';
import { UserDTO } from '../users/users.dto.js';
import { AuthDTO, RegisterUserDTO } from './auth.dto.js';
import { User } from '../users/users.entities.js';
import { AUTH_SALT_ROUNDS, AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly algorithm = 'aes-256-cbc';

  constructor (
    private jwt: JwtService,
    private userService: UserService
  ) { }

  async registerUser({ username, email, password }: RegisterUserDTO) {
    const existingUser = await this.userService.getUserByUserNameAndEmail(username, email);

    if (existingUser) {
      const extra = existingUser.email === email ? `email ${email}` : `username ${username}`;
      throw new BadRequestException(`User with ${extra} already exists`);
    }

    const newUser: Omit<User, 'id'> = {
      username,
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
        name: user.username,
        isAdmin: user.isAdmin,
        email: user.email,
        emailConfirmed: user.emailConfirmed,
        needPasswordReset: user.needPasswordReset
      }),
      refreshToken: 'NOT IMPLEMENTED',
      refreshTokenExpiresIn: 0
    };
  }

  async checkPasswordForUser(username: string, password: string) {
    const user = await this.userService.getUserByUserNameOrEmail(username);

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