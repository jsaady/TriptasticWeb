import pg from 'pg';

export const PG_PUBSUB_CLIENT = 'PG_PUBSUB_CLIENT';

export const PG_PUBSUB_OPTIONS = 'PG_PUBSUB_OPTIONS'

export type PGPubSubOptions = ConstructorParameters<typeof pg.Client>[0];

export const pgPubSubProvider = {
  provide: PG_PUBSUB_CLIENT,
  useFactory: async (options: PGPubSubOptions) => {
    const client = new pg.Client(options);

    await client.connect();
    
    return client;
  },
  inject: [PG_PUBSUB_OPTIONS]
};
