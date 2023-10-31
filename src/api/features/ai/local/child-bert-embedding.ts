import { Logger } from '@nestjs/common';


import USE, { UniversalSentenceEncoder } from '@tensorflow-models/universal-sentence-encoder';
import '@tensorflow/tfjs-node';
import { ChildEmbedWorkerEvents, EmbedWorkerMessage, ParentEmbedWorkerEvents } from './embed-worker-types.js';
import { UniversalSentenceEncoderQnA } from '@tensorflow-models/universal-sentence-encoder/dist/use_qna.js';
import { parentPort } from 'worker_threads';

const logger = new Logger('EmbeddingsWorker');

let use: UniversalSentenceEncoder;
let qna: UniversalSentenceEncoderQnA;

const loadModel = async () => {
  use = await USE.load();
  qna = await USE.loadQnA();
  await qna.load();
  process.send?.({ event: ChildEmbedWorkerEvents.loaded });
}

const createEmbeddings = async (
  messages: string[],
  id: string
) => {
  const embeddings = await use.embed(messages);

  const rawEmbeddings = await embeddings.array();

  process.send?.({
    event: ChildEmbedWorkerEvents.complete,
    id,
    data: rawEmbeddings
  })
};

const createQna = async (
  messages: string[],
  id: string
) => {
  
}

logger.log('Worker started');

process.on('message', ({ event, data, id }: EmbedWorkerMessage<ParentEmbedWorkerEvents>) => {
  logger.log(`Worker received ${event} (${id})`);

  switch (event) {
    case ParentEmbedWorkerEvents.load:
      loadModel();
      break;
    case ParentEmbedWorkerEvents.createEmbeddings:
      createEmbeddings(data, id);
      break;
  }
});
