import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterUserDTO } from './auth.dto.js';

@Controller('/auth')
export class AuthController {
  constructor (
    private authService: AuthService
  ) { }

  @Post('/login')
  login(@Body() {username, password}: {username: string, password: string}, @Res({ passthrough: true }) response: Response) {
    return this.authService.loginUser(username, password);
  }

  @Post('/register')
  register(@Body() {username, email, password}: RegisterUserDTO) {
    return this.authService.registerUser({ username, email, password });
  }
}
