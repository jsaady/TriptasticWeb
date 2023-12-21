import { Logger } from '@nestjs/common';
import { LlamaCpp } from "langchain/llms/llama_cpp";
import { resolve } from 'path';
import { ChatWorkerMessage, ChildChatWorkerEvents, ParentChatWorkerEvents } from './chat-worker-types.js';

const modelPath = resolve(process.cwd(), "./models/neural-chat-7b-v3-3.Q4_0.gguf");

const model = new LlamaCpp({
  modelPath,
  useMlock: true,
  batchSize: 512,
});


const logger = new Logger('ChatWorker');

const loadModel = async () => {
  process.send?.({ event: ChildChatWorkerEvents.loaded });
}

const createCompletion = async (
  message: string,
  context: string,
  id: string
) => {
  try {

    const prompt = `${context}

    ${message}`;

    const fullResponse = await model.invoke(prompt);
    const stream = await model.stream(prompt);

    for await (const chunk of stream) {
      process.send?.({
        event: ChildChatWorkerEvents.newToken,
        id,
        data: chunk
      });
    }

    process.send?.({
      event: ChildChatWorkerEvents.complete,
      id,
      data: ''
    });
  } catch (error) {
    console.error(error);
    process.send?.({
      event: ChildChatWorkerEvents.complete,
      id,
      data: ''
    });
  }
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

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Handle the error here
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Handle the rejection here
});

