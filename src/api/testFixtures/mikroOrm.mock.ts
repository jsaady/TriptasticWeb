import { MikroOrmModule } from '@mikro-orm/nestjs';
import {getTestMikroOrmConfig} from "../db/testConfig.js";

export const CreateMikroORM = (entities: any[]) => {
  return [
    MikroOrmModule.forRootAsync({
      useFactory: () => getTestMikroOrmConfig(),
    }),
    MikroOrmModule.forFeature(entities),
  ]
};