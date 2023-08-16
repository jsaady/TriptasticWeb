import { AsyncLocalStorage } from 'async_hooks';
import { ContextService } from './context.service.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContextMiddleware } from './context.middleware.js';

@Module({
  providers: [
    ContextService,
    ContextMiddleware,
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [ContextService],
})
export class ContextModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
