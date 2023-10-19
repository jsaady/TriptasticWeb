import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { ConfigService } from '../../../utils/config/config.service.js';
import { EmbeddingsService } from '../embeddings.service.js';
import { OllamaService } from './base-ollama.service.js';

@Injectable()
export class OllamaEmbeddingsService extends OllamaService implements EmbeddingsService {
  async getEmbeddings(text: string): Promise<number[]> {
    const { data: { embedding } } = await this.ollamaApi.post('/api/embeddings', {
      model: this.config.getOrThrow('ollamaEmbeddingModel'), 
      prompt: text
    });

    return embedding;
  }
}
