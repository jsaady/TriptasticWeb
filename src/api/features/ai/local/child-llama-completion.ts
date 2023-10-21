import { Logger } from '@nestjs/common';
import { LlamaChatSession, LlamaContext, LlamaModel } from "node-llama-cpp";
import { resolve } from 'path';
import { ChatWorkerMessage, ChildChatWorkerEvents, ParentChatWorkerEvents } from './chat-worker-types.js';

const modelPath = resolve(process.cwd(), "./models/mistral-7b-instruct.bin");

const model = new LlamaModel({
  modelPath,
  useMlock: true
});
const llamaContext = new LlamaContext({ model });


const logger = new Logger('ChatWorker');

const loadModel = () => {
  process.send?.({ event: ChildChatWorkerEvents.loaded });
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
        event: ChildChatWorkerEvents.newToken,
        id,
        data: llamaContext.decode(token)
      });
    }
  });


  process.send?.({
    event: ChildChatWorkerEvents.complete,
    id,
    data: response
  });
}

logger.log('Worker started');

process.on('message', ({ event, data, id }: ChatWorkerMessage<ParentChatWorkerEvents>) => {
  logger.log(`Worker received ${event} (${id})`);

  switch (event) {
    case ParentChatWorkerEvents.load:
      loadModel();
      break;
    case ParentChatWorkerEvents.createCompletion:
      createCompletion(data.message, data.context, id);
      break;
  }
});
