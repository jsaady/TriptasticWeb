import { Injectable, Logger } from '@nestjs/common';
import { resolve } from 'path';
import { filter, firstValueFrom, map } from 'rxjs';
import { v4 } from 'uuid';
import { WorkerService } from '../../../utils/workers/worker.service.js';
import { Runtime } from '../../../utils/workers/workers.config.js';
import { ChatService } from '../chat.service.js';
import { ChatWorkerMessage, ChildChatWorkerEvents, ParentChatWorkerEvents } from './chat-worker-types.js';

@Injectable()
export class LocalLlamaChatService implements ChatService {
  constructor (
    private workerService: WorkerService
  ) { this.load$ = this.loadWorker() }

  logger = new Logger('LocalLlama');

  workerLocation = resolve(new URL(import.meta.url).pathname, '..', 'child-llama-completion.js');
  load$: Promise<any>;

  async getReply (message: string, context: string): Promise<string> {
    let response = '';

    for await (const token of this.getReplyStream(message, context)) {
      response += token;
    }

    return response;
  }

  async *getReplyStream (message: string, context: string) {
    await this.load$;
    const streamContextId = v4();
    this.postToWorker({
      data: {
        message,
        context,
      },
      event: ParentChatWorkerEvents.createCompletion,
      id: streamContextId
    });

    let completed = false;
    let push: (() => void)|undefined;
    const queue: string[] = [];
    const nextItem = () => new Promise<void>(resolve => push = resolve);

    const handleWorkerData = (evt: ChatWorkerMessage<ChildChatWorkerEvents>) => {
      this.logger.log(`Main received ${evt.event}(${evt.id})`);
      if (evt.id !== streamContextId) return;

      switch (evt.event) {
        case ChildChatWorkerEvents.newToken:
          queue.push(evt.data);
          if (push) {
            push();
            push = undefined;
          }
          break;

        case ChildChatWorkerEvents.complete:
          completed = true;
          break;
      }
    };

    const sub = this.workerService.getMessages<ChatWorkerMessage<ChildChatWorkerEvents>>(this.workerLocation)
      .pipe(filter(e => e.id === streamContextId))
      .subscribe((e) => {
        handleWorkerData(e);
      });

    try {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift()!;
        } else if (completed) {
          return;
        } else {
          await nextItem();
        }
      }
    } finally {
      sub.unsubscribe();
    }
  }

  async loadWorker () {
    this.workerService.createWorker(this.workerLocation, { runtime: Runtime.child_process_fork });

    this.postToWorker({
      event: ParentChatWorkerEvents.load,
      data: {},
      id: v4()
    });
  
    await firstValueFrom(this.workerService.getMessages<ChatWorkerMessage<ChildChatWorkerEvents>>(this.workerLocation)
      .pipe(filter((e) => e.event === ChildChatWorkerEvents.loaded))
      .pipe(map(() => true)));
  }

  postToWorker (message: ChatWorkerMessage<ParentChatWorkerEvents>) {
    return this.workerService.sendMessageToWorker(this.workerLocation, message);
  }
}
