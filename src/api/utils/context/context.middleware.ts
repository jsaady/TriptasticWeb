import { Injectable, NestMiddleware } from '@nestjs/common';
import { Context, ContextService } from './context.service.js';
import { v4 } from 'uuid';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor (
    private contextService: ContextService
  ) { }

  use (req: any, res: any, next: (error?: any) => void) {
    this.contextService.start(req, next);
  }
}