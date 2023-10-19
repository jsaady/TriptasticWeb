import { Logger } from '@nestjs/common';


import USE, { UniversalSentenceEncoder } from '@tensorflow-models/universal-sentence-encoder';
import '@tensorflow/tfjs-node';

const logger = new Logger('EmbeddingsWorker');

let use: UniversalSentenceEncoder;

export enum ChildEmbedEvents {
  loaded = 'loaded',
  complete = 'complete'
}

export enum ParentEmbedEvents {
  load = 'load',
  createEmbeddings = 'createEmbeddings'
}

export interface EmbedMessage<T extends ChildEmbedEvents|ParentEmbedEvents> {
  event: T;
  id: string;
  data?: any;
}

const loadModel = async () => {
  use = await USE.load();
  process.send?.({ event: ChildEmbedEvents.loaded });
}

const createEmbeddings = async (
  messages: string[],
  id: string
) => {

  const embeddings = await use.embed(messages);

  const rawEmbeddings = await embeddings.array();


  process.send?.({
    event: ChildEmbedEvents.complete,
    id,
    data: rawEmbeddings
  })
}

logger.log('Worker started');

process.on('message', ({ event, data, id }: EmbedMessage<ParentEmbedEvents>) => {
  logger.log(`Worker received ${event} (${id})`);

  switch (event) {
    case ParentEmbedEvents.load:
      loadModel();
      break;
    case ParentEmbedEvents.createEmbeddings:
      createEmbeddings(data, id);
      break;
  }
});
