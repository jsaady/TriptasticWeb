import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterUserDTO } from './auth.dto.js';
import { AuthService } from './auth.service.js';
import { IsAuthenticated } from './isAuthenticated.guard.js';
import { AUTH_TOKEN_EXPIRATION } from './auth.constants.js';

@Controller('/auth')
export class AuthController {
  constructor (
    private authService: AuthService
  ) { }

  @Post('/login')
  async login(@Body() {email, password}: {email: string, password: string}, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.loginUser(email, password);

    response.cookie('Authorization', Buffer.from(JSON.stringify(token)).toString('base64'), {
      maxAge: AUTH_TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      signed: true
    });

    return token;
  }

  @Post('/register')
  async register(@Body() {email, password}: RegisterUserDTO, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.registerUser({ email, password });

    response.cookie('Authorization', Buffer.from(JSON.stringify(token)).toString('base64'), {
      maxAge: AUTH_TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      signed: true
    });

    return token;
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('Authorization');

    return {};
  }

  @Get('/me')
  @UseGuards(IsAuthenticated)
  getMe(@Req() req: Request) {
    return req.user ?? {};
  }
}
