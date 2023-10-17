import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../utils/config/config.service.js';
import { ChatService } from '../chat.service.js';
import { OpenAIService } from './base-openai.service.js';

@Injectable()
export class OpenAIChatService extends OpenAIService implements ChatService {
  constructor (
    config: ConfigService,
  ) {
    super(config);
    this.openaiModel = this.config.get('openaiChatModel') ?? 'gpt-3.5-turbo';
  }

  private openaiModel: string;

  async getReply(text: string, context: string): Promise<string> {
    const { data: { choices: [{ message: { content } }] } } = await this.openaiApi.post('/v1/chat/completions', {
      model: this.openaiModel, 
      messages: [{
        role: 'system',
        content: context
      }, {
        role: 'user',
        content: text
      }]
    });

    return content;
  }
}
