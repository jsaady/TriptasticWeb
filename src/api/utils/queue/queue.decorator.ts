import { Job } from 'pg-boss';

export enum QueueHandlerType {
  basic,
  schedule
}

export interface BasicQueueMetadata {
  provider: Function;
  key: string | symbol;
  handlerType: QueueHandlerType.basic;
}

export interface ScheduledQueueMetadata {
  provider: Function;
  key: string | symbol;
  handlerType: QueueHandlerType.schedule;
  schedule: string;
}

export type QueueMetadata = ScheduledQueueMetadata|BasicQueueMetadata;

export const queueMetadataStore = new Map<string, QueueMetadata[]>();

export const ProcessQueue = (queueName: string) => (item: any, key: string | symbol, _descriptor: TypedPropertyDescriptor<(job: Job) => any>) => {
  const metadata = queueMetadataStore.get(queueName) ?? [];

  metadata.push({
    provider: item.constructor,
    key,
    handlerType: QueueHandlerType.basic
  });

  queueMetadataStore.set(queueName, metadata);
};

export const ScheduledQueue = (schedule: string) => (item: Object, key: string | symbol, _descriptor: TypedPropertyDescriptor<(job: Job) => any>) => {
  const queueName = `${item.constructor.name}_${String(key)}`;
  const metadata = queueMetadataStore.get(queueName) ?? [];

  metadata.push({
    provider: item.constructor,
    key,
    handlerType: QueueHandlerType.schedule,
    schedule
  });

  queueMetadataStore.set(queueName, metadata);
};


