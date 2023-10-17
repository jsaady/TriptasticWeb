import { Inject } from '@nestjs/common';

export interface ChatService {
  getReply(message: string, context: string): Promise<string>;
}

export const CHAT_SERVICE = 'CHAT_SERVICE';

export const InjectChat = () => Inject(CHAT_SERVICE);