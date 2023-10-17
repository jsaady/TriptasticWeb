import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { ConfigService } from '../../../utils/config/config.service.js';

@Injectable()
export class OpenAIService {
  protected openaiApi: Axios;
  constructor (
    protected config: ConfigService,
  ) {
    this.openaiApi = axios.create({
      baseURL: this.config.get('openaiUrl') ?? 'https://api.openai.com',
      headers: {
        'Authorization': 'Bearer ' + this.config.getOrThrow('openaiKey')
      }
    });
  }
}
