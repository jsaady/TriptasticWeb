import { getRepositoryToken } from '@mikro-orm/nestjs';
import { IS_MIGRATED } from '../../db/migration.provider.js';
import { GeneratedConfigService } from './generated-config.service.js';
import { GeneratedConfig } from './generated-config.entity.js';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';

describe('GeneratedConfigService', () => {
  let service: GeneratedConfigService;
  const mockEm: Partial<Record<keyof EntityManager, jest.Mock>> = {
    findOne: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
    fork: jest.fn().mockImplementation(() => mockEm)
  };
  beforeEach(async () => {


    const module = await Test.createTestingModule({
      providers: [
        GeneratedConfigService,
        {
          provide: IS_MIGRATED,
          useValue: true,
        },
        {
          provide: getRepositoryToken(GeneratedConfig),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            persistAndFlush: jest.fn(),
            getEntityManager: jest.fn().mockReturnValue(mockEm),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GeneratedConfigService>(GeneratedConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch config', async () => {
    const existingConfig = {
      id: 1,
      jwtSecret: 'jwtSecret',
      cookieSecret: 'cookie secret',
      vapidPublic: 'vapid public',
      vapidPrivate: 'vapid private',
    };
    mockEm.findOne?.mockResolvedValue(existingConfig);
    const config = await service.fetchConfig();

    expect(config).toMatchObject({
      ...existingConfig,
    });
  });

  it('should initialize config', async () => {
    mockEm.findOne?.mockResolvedValue(null);
    mockEm.create?.mockImplementation((_, data) => data);
    const config = await service.fetchConfig();

    expect(config).toMatchObject({
      id: 1,
      jwtSecret: expect.any(String),
      cookieSecret: expect.any(String),
      vapidPublic: expect.any(String),
      vapidPrivate: expect.any(String),
    });
  });
});