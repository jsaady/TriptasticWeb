import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { filter, firstValueFrom, map } from 'rxjs';
import { v4 } from 'uuid';
import { WorkerService } from '../../../utils/workers/worker.service.js';
import { Runtime } from '../../../utils/workers/workers.config.js';
import { EmbeddingsService } from '../embeddings.service.js';
import { ChildEmbedEvents, EmbedMessage, ParentEmbedEvents } from './child-bert-embedding.js';
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
      event: ParentEmbedEvents.createEmbeddings,
      data: texts,
      id: embeddingCtx
    });

    const embeddings = await firstValueFrom(this.workerService.getMessages(this.workerLocation)
      .pipe(filter(({ event, id }) => event === ChildEmbedEvents.complete && id === embeddingCtx))
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
      event: ParentEmbedEvents.load,
      data: {},
      id: v4()
    });
  
    await firstValueFrom(this.workerService.getMessages<EmbedMessage<ChildEmbedEvents>>(this.workerLocation)
      .pipe(filter((e) => e.event === ChildEmbedEvents.loaded))
      .pipe(map(() => true)));
  }

  postToWorker (message: EmbedMessage<ParentEmbedEvents>) {
    return this.workerService.sendMessageToWorker(this.workerLocation, message);
  }
}
