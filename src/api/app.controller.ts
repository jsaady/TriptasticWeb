import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get('/')
  getRoot() {
    return { result: 'ok there bud' };
  }

  @Get('/protected')
  protected() {

  }
}
