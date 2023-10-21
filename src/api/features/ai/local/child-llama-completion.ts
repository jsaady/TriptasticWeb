import { LlamaChatSession, LlamaContext, LlamaModel } from "node-llama-cpp";
import { Logger } from '@nestjs/common';
import { resolve } from 'path';

const modelPath = resolve(process.cwd(), "./models/mistral-7b-instruct.bin");

const model = new LlamaModel({
  modelPath,
  useMlock: true
});
const llamaContext = new LlamaContext({ model });


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
  process.send?.({ event: ChildEvents.loaded });
}

const createCompletion = async (
  message: string,
  context: string,
  id: string
) => {
  // const prompt = `
  // <s>
  // [INST]
  // ${context}

  // User's message ${message}
  // [/INST]`;

  const session = new LlamaChatSession({ context: llamaContext, systemPrompt: context });

  console.log(session);

  const response = await session.prompt(message, {
    onToken: (token) => {
      process.send?.({
        event: ChildEvents.newToken,
        id,
        data: llamaContext.decode(token)
      });
    }
  });


  process.send?.({
    event: ChildEvents.complete,
    id,
    data: response
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
