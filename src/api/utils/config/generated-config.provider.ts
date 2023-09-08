import { GeneratedConfigService } from './generated-config.service.js';

export const GENERATED_CONFIG = 'GENERATED_CONFIG';

export const GENERATED_CONFIG_PROVIDER = {
  provide: GENERATED_CONFIG,
  useFactory: async (repo: GeneratedConfigService) => {
    return repo.fetchConfig();
  },
  inject: [GeneratedConfigService],
};
