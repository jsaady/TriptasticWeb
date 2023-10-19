import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../utils/config/config.service.js';
import { ChatService } from '../chat.service.js';
import { OpenAIService } from './base-openai.service.js';

@Injectable()
export class OpenAIChatService extends OpenAIService implements ChatService {
  constructor(
    config: ConfigService,
  ) {
    super(config);
    this.openaiModel = this.config.get('openaiChatModel') ?? 'gpt-3.5-turbo';
  }

  private openaiModel: string;

  async getReply (text: string, context: string): Promise<string> {
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

  async *getReplyStream (message: string, context: string): AsyncGenerator<string, void, void> {

    const response = await fetch(`${this.openaiApiUrl}/v1/chat/completions`, {
      method: 'POST',
      body: JSON.stringify({
        model: this.openaiModel,
        stream: true,
        messages: [{
          role: 'system',
          content: context
        }, {
          role: 'user',
          content: message
        }]
      }),
      headers: {
        Authorization: `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder("utf-8");

    let buff = '';

    while (true) {
      let shouldBail = false;
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Massage and parse the chunk of data
      const chunk = decoder.decode(value);
      buff += chunk;
      const lines = buff.split("\n\n");

      if (lines.length > 1) {
        lines;
      }

      const parsedLines = lines
        .map((line) => {
          return line.replace(/^data: /, "").trim()
        }) // Remove the "data: " prefix
        .filter((line) => {
          return line !== "" && line !== "[DONE]";
        }) // Remove empty lines and "[DONE]"
        .map((line, i, arr) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            // likely need to combine with next chunk
            shouldBail = true;
            return { choices: [{ delta: { content: '' } }] }
          }
        });

      if (shouldBail) continue;


      // if we didn't need to bail, reset the buffer
      buff = '';

      let fullContent = '';
      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content = '' } = delta;
        fullContent += content;
      }
      await new Promise<void>(res => setTimeout(() => res(), 1));
      yield fullContent;
    }
  }
}
