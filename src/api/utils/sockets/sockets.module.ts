import { Global, Module } from '@nestjs/common';
import { PubSubModule } from '../pubSub/pubSub.module.js';
import { SocketStateService } from './socket-state.service.js';
import { SocketIOPropagatorService } from './socket.propagator.js';
import { SocketsGateway } from './sockets.gateway.js';

@Global()
@Module({
  imports: [PubSubModule],
  controllers: [],
  providers: [
    SocketsGateway,
    SocketStateService,
    SocketIOPropagatorService,
  ],
  exports: [
    SocketIOPropagatorService
  ],
})
export class SocketsModule { }
