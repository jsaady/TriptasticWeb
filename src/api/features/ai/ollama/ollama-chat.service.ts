import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat.service.js';
import { OllamaService } from './base-ollama.service.js';

@Injectable()
export class OllamaChatService extends OllamaService implements ChatService {
  async getReply(prompt: string, context: string): Promise<string> {
    const { data: { response } } = await this.ollamaApi.post('/api/generate', {
      model: this.config.getOrThrow('ollamaChatModel'),
      prompt,
      system: context,
      stream: false,
    });

    return response;
  }

  async *getReplyStream(message: string, context: string): AsyncGenerator<string, void, void> {
    const response = await fetch(`${this.config.getOrThrow('ollamaUrl')}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: this.config.getOrThrow('ollamaChatModel'),
        prompt: message,
        temperature: 1.0,
        system: context,
        stream: true,
      })
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
      const lines = buff.split("\n");
  
      const parsedLines = lines
        .filter((line) => {
          return line !== "";
        }) // Remove empty lines and "[DONE]"
        .map((line, i, arr) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            // likely need to combine with next chunk
            shouldBail = true;
            return { response: '' }
          }
        });
  
      if (shouldBail) continue;
  
  
      // if we didn't need to bail, reset the buffer
      buff = '';
  
      let fullContent = '';
      for (const { response } of parsedLines) {
        fullContent += response;
      }
  
      yield fullContent;
    }
  }
}
