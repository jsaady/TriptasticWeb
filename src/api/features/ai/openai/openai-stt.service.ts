import FormData from 'form-data';
import { Injectable } from '@nestjs/common';
import { STTService } from '../stt.service.js';
import { OpenAIService } from './base-openai.service.js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class OpenAISTTService extends OpenAIService implements STTService {
  async *audioStreamToText(stream: any): AsyncGenerator<string, any, unknown> {
    const formData = new FormData();
    writeFileSync(resolve(process.cwd(), 'file_name.wav'), stream);
    formData.append('file', stream, 'file_name.wav');
    formData.append('model', 'whisper-1');
    formData.append('temperature', '0.1');
    formData.append('language', 'en'); // TODO: determine from user

    try {
      const response = await this.openaiApi.post('/v1/audio/transcriptions', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      yield response.data.text;
    } catch (e) {
      e;
      throw e;
    }

  }
}
