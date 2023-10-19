import { Inject } from '@nestjs/common';

export interface EmbeddingsService {
  bulkGetEmbeddings?(texts: string[]): number[][]|Promise<number[][]>;
  getEmbeddings(text: string): number[]|Promise<number[]>;
}

export const EMBEDDINGS_SERVICE = 'EMBEDDINGS_SERVICE';
export const InjectEmbeddingsService = () => Inject(EMBEDDINGS_SERVICE);
