import { Inject } from '@nestjs/common';

export interface EmbeddingsService {
  getEmbeddings(text: string): number[]|Promise<number[]>;
}

export const EMBEDDINGS_SERVICE = 'EMBEDDINGS_SERVICE';
export const InjectEmbeddingsService = () => Inject(EMBEDDINGS_SERVICE);
