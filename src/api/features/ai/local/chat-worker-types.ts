
export enum ChildChatWorkerEvents {
  loaded = 'loaded',
  newToken = 'newToken',
  complete = 'complete'
}

export enum ParentChatWorkerEvents {
  load = 'load',
  createCompletion = 'createCompletion'
}

export interface ChatWorkerMessage<T extends ChildChatWorkerEvents | ParentChatWorkerEvents> {
  event: T;
  id: string;
  data?: any;
}
