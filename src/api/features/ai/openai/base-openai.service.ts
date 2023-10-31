import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { ConfigService } from '../../../utils/config/config.service.js';

@Injectable()
export class OpenAIService {
  protected openaiApi: Axios;
  protected openaiApiUrl: string;
  protected openaiApiKey: string;
  constructor (
    protected config: ConfigService,
  ) {
    this.openaiApiUrl = this.config.get('openaiUrl', 'https://api.openai.com');
    this.openaiApiKey = this.config.getOrThrow('openaiKey');
    this.openaiApi = axios.create({
      baseURL: this.openaiApiUrl,
      headers: {
        'Authorization': 'Bearer ' + this.openaiApiKey
      }
    });
  }
}
