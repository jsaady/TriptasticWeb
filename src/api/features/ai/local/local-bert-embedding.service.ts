import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { filter, firstValueFrom, map } from 'rxjs';
import { v4 } from 'uuid';
import { EmbeddingsService } from '../embeddings.service.js';
import { ChildEmbedWorkerEvents, EmbedWorkerMessage, ParentEmbedWorkerEvents } from './embed-worker-types.js';
import { Runtime, WorkerService } from '@nestjs-enhanced/workers';
@Injectable()
export class LocalBertEmbeddingService implements EmbeddingsService {
  load$: Promise<any>;
  workerLocation = resolve(new URL(import.meta.url).pathname, '..', 'child-bert-embedding.js');

  constructor (
    private workerService: WorkerService
  ) { this.load$ = this.load() }

  async bulkGetEmbeddings(texts: string[]): Promise<number[][]> {
    await this.load$;

    const embeddingCtx = v4();

    this.postToWorker({
      event: ParentEmbedWorkerEvents.createEmbeddings,
      data: texts,
      id: embeddingCtx
    });

    const embeddings = await firstValueFrom(this.workerService.getMessages(this.workerLocation)
      .pipe(filter(({ event, id }) => event === ChildEmbedWorkerEvents.complete && id === embeddingCtx))
      .pipe(map(({ data }) => data)));

    return embeddings;
  }

  async getEmbeddings(text: string) {
    const [embedding] = await this.bulkGetEmbeddings([text]);

    return embedding;
  }

  private async load () {
    this.workerService.createWorker(this.workerLocation, { runtime: Runtime.child_process_fork });

    this.postToWorker({
      event: ParentEmbedWorkerEvents.load,
      data: {},
      id: v4()
    });
  
    await firstValueFrom(this.workerService.getMessages<EmbedWorkerMessage<ChildEmbedWorkerEvents>>(this.workerLocation)
      .pipe(filter((e) => e.event === ChildEmbedWorkerEvents.loaded))
      .pipe(map(() => true)));
  }

  postToWorker (message: EmbedWorkerMessage<ParentEmbedWorkerEvents>) {
    return this.workerService.sendMessageToWorker(this.workerLocation, message);
  }
}
