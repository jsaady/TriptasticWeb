import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './features/auth/auth.service.js';
import { IsAuthenticated } from './features/auth/isAuthenticated.guard.js';

@Controller()
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
