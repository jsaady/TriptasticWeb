// create a nestjs socket gateway

import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { InjectPubSub, PubSubService } from '../pubSub/pubSub.service.js';

@WebSocketGateway()
export class SocketsGateway {
    constructor(@InjectPubSub() private readonly pubSub: PubSubService<any>) {}

    @SubscribeMessage('events')
    async onEvent(client: any, data: any): Promise<any> {
        await this.pubSub.publish('events', data);
        return { event: 'events', data };
    }
}
