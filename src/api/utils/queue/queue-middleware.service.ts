import { Injectable } from '@nestjs/common';
import { InternalQueueMiddlewareService, QueueMiddleware } from './internal-queue-middleware.service.js';

@Injectable()
export class QueueMiddlewareService {
  constructor (
    private intQueue: InternalQueueMiddlewareService
  ) { }

  register (mw: QueueMiddleware) {
    return this.intQueue.register(mw);
  }
}
