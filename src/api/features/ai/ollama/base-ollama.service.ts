import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { ConfigService } from '../../../utils/config/config.service.js';
import { EmbeddingsService } from '../embeddings.service.js';

export class OllamaService {
  protected ollamaApi: Axios;
  constructor (
    private config: ConfigService,
  ) {
    this.ollamaApi = axios.create({
      baseURL: this.config.getOrThrow('ollamaUrl')
    });
    this.ollamaModel = this.config.getOrThrow('ollamaModel');
  }

  protected ollamaModel: string;
}
