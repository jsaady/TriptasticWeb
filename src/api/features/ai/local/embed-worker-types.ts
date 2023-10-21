
export enum ChildEmbedWorkerEvents {
  loaded = 'loaded',
  complete = 'complete'
}

export enum ParentEmbedWorkerEvents {
  load = 'load',
  createEmbeddings = 'createEmbeddings'
}

export interface EmbedWorkerMessage<T extends ChildEmbedWorkerEvents | ParentEmbedWorkerEvents> {
  event: T;
  id: string;
  data?: any;
}
