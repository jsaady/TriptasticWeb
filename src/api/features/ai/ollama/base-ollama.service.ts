import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { ConfigService } from '../../../utils/config/config.service.js';
import { EmbeddingsService } from '../embeddings.service.js';

@Injectable()
export class OllamaService {
  protected ollamaApi: Axios;
  constructor (
    protected config: ConfigService,
  ) {
    this.ollamaApi = axios.create({
      baseURL: config.getOrThrow('ollamaUrl')
    });
  }
}
