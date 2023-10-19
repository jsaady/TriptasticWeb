import { Injectable, Logger } from '@nestjs/common';
import { LLM } from "llama-node";
import { LLamaCpp, LoadConfig } from "llama-node/dist/llm/llama-cpp.js";
import { resolve } from 'path';
import { ChatService } from '../chat.service.js';
// import { LLMRS } from "llama-node/dist/llm/llm-rs.js";
// import { Generate, ModelType } from '@llama-node/core';
import { Generate } from '@llama-node/llama-cpp';
import { filter, firstValueFrom, map } from 'rxjs';
import { v4 } from 'uuid';
import { WorkerService } from '../../../utils/workers/worker.service.js';
import { Runtime } from '../../../utils/workers/workers.config.js';
import { ChildEvents, Message, ParentEvents } from './child-llama-completion.js';

const model = resolve(process.cwd(), "./models/llama2-7b-chat");
const llama = new LLM(LLamaCpp);
const loadConfig: LoadConfig = {
  modelPath: model,
  enableLogging: true,
  nCtx: 1024,
  seed: 0,
  f16Kv: false,
  logitsAll: false,
  vocabOnly: false,
  useMlock: false,
  embedding: false,
  useMmap: true,
  nGpuLayers: 0
};
@Injectable()
export class LocalLlamaChatService implements ChatService {
  constructor (
    private workerService: WorkerService
  ) { this.load$ = this.loadWorker() }

  logger = new Logger('LocalLlama');

  workerLocation = resolve(new URL(import.meta.url).pathname, '..', 'child-llama-completion.js');
  load$: Promise<any>;
  
  private async getParams (context: string, message: string) {
    await llama.load(loadConfig);
    const prompt = `
      ${context}

      ### Prompt: ${message}

      ### Reply:`;

    const params: Generate = {
      nThreads: 4,
      nTokPredict: 2048,
      topK: 40,
      topP: 0.1,
      temp: 0.7,
      repeatPenalty: 1.5,
      prompt,
    };
    return params;
  }

  async getReply (message: string, context: string): Promise<string> {
    const params: Generate = await this.getParams(context, message);

    const result = await llama.createCompletion(params, (response) => {
      console.log(response.token);
    });

    return result.tokens.join('');
  }

  async *getReplyStream (message: string, context: string) {
    await this.load$;
    const streamContextId = v4();
    this.postToWorker({
      data: {
        message,
        context,
      },
      event: ParentEvents.createCompletion,
      id: streamContextId
    });

    let completed = false;
    let push: (() => void)|undefined;
    const queue: string[] = [];
    const nextItem = () => new Promise<void>(resolve => push = resolve);

    const handleWorkerData = (evt: Message<ChildEvents>) => {
      this.logger.log(`Main received ${evt.event}(${evt.id})`);
      if (evt.id !== streamContextId) return;

      switch (evt.event) {
        case ChildEvents.newToken:
          queue.push(evt.data);
          if (push) {
            push();
            push = undefined;
          }
          break;

        case ChildEvents.complete:
          completed = true;
          break;
      }
    };

    const sub = this.workerService.getMessages<Message<ChildEvents>>(this.workerLocation)
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
      event: ParentEvents.load,
      data: {},
      id: v4()
    });
  
    await firstValueFrom(this.workerService.getMessages<Message<ChildEvents>>(this.workerLocation)
      .pipe(filter((e) => e.event === ChildEvents.loaded))
      .pipe(map(() => true)));
  }

  postToWorker (message: Message<ParentEvents>) {
    return this.workerService.sendMessageToWorker(this.workerLocation, message);
  }
}
