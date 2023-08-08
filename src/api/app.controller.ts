import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service.js';
import { IsAuthenticated } from './auth/isAuthenticated.guard.js';

@Controller()
@UseGuards(IsAuthenticated)
export class AppController {
  constructor (
    private authService: AuthService
  ) { }

  @Get('/')
  getRoot() {
    return { result: 'ok there bud' };
  }

  @Get('/protected')
  protected() {

  }
}
