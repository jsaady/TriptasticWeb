import { Inject } from '@nestjs/common';

export interface STTService {
  audioStreamToText(stream: any): AsyncGenerator<string>;
}

export const STT_SERVICE = 'STT_SERVICE';
export const InjectSTTService = () => Inject(STT_SERVICE);
