import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
@WebSocketGateway()
@Injectable()
export class SocketGateway { }
