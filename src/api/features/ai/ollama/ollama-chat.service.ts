import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat.service.js';
import { OllamaService } from './base-ollama.service.js';

@Injectable()
export class OllamaChatService extends OllamaService implements ChatService {

  async getReply(prompt: string): Promise<string> {
    const { data: { response } } = await this.ollamaApi.post('/api/generate', {
      model: this.ollamaModel,
      prompt,
      stream: false,
    });

    return response;
  }
}