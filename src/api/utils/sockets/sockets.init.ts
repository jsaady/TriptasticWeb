import { INestApplication, NestMiddleware } from '@nestjs/common';

import { SocketAdapter } from './socket.adapter.js';
import { SocketStateService } from './socket-state.service.js';
import { SocketIOPropagatorService } from './socket.propagator.js';
import { AuthService } from '../../features/auth/auth.service.js';
import { Request } from 'express';

// TODO: fix middleware type
export const initSocketAdapters = (app: INestApplication, getUserIdFromRequest: (req: Request) => undefined|string|Promise<string|undefined>, ...middlewares: any[]): INestApplication => {
    const socketStateService = app.get(SocketStateService);
    const socketPropagatorService = app.get(SocketIOPropagatorService);

    app.useWebSocketAdapter(new SocketAdapter(app, socketStateService, socketPropagatorService, getUserIdFromRequest, middlewares ?? []));

    return app;
};
