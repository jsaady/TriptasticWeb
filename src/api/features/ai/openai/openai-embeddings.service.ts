import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { ConfigService } from '../../../utils/config/config.service.js';
import { EmbeddingsService } from '../embeddings.service.js';
import { OpenAIService } from './base-openai.service.js';

@Injectable()
export class OpenAIEmbeddingsService extends OpenAIService implements EmbeddingsService {
  constructor (
    config: ConfigService,
  ) {
    super(config);
    this.openaiModel = this.config.get('openaiEmbeddingModel') ?? 'text-embedding-ada-002';
  }

  private openaiModel: string;

  async getEmbeddings(text: string): Promise<number[]> {
    const { data: { data: [{ embedding }] } } = await this.openaiApi.post('/v1/embeddings', {
      model: this.openaiModel, 
      input: text
    });

    return embedding;
  }
}
