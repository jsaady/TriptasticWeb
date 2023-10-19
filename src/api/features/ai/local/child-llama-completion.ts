import type { Generate } from '@llama-node/llama-cpp';
import { Logger } from '@nestjs/common';
import { LLM } from 'llama-node';
import { LLamaCpp, LoadConfig } from 'llama-node/dist/llm/llama-cpp.js';
import { resolve } from 'path';

const model = resolve(process.cwd(), "./models/llama2-7b-chat");

const llama = new LLM(LLamaCpp);

const logger = new Logger('ChatWorker');

export enum ChildEvents {
  loaded = 'loaded',
  newToken = 'newToken',
  complete = 'complete'
}

export enum ParentEvents {
  load = 'load',
  createCompletion = 'createCompletion'
}

export interface Message<T extends ChildEvents|ParentEvents> {
  event: T;
  id: string;
  data?: any;
}

const loadModel = () => {
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
  
  llama.load(loadConfig).then(() => {
    process.send?.({ event: ChildEvents.loaded });
  });
}

const createCompletion = async (
  message: string,
  context: string,
  id: string
) => {
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


  await llama.createCompletion(params, (response) => {
    logger.log(response);
    
    if (response.completed) {
      process.send?.({
        event: ChildEvents.complete,
        id,
        data: response.token
      })
    } else {
      process.send?.({
        event: ChildEvents.newToken,
        id,
        data: response.token
      });
    }
  });
}

logger.log('Worker started');

process.on('message', ({ event, data, id }: Message<ParentEvents>) => {
  logger.log(`Worker received ${event} (${id})`);

  switch (event) {
    case ParentEvents.load:
      loadModel();
      break;
    case ParentEvents.createCompletion:
      createCompletion(data.message, data.context, id);
      break;
  }
});
