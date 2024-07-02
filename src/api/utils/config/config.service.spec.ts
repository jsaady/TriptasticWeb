import { ConfigService } from './config.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GENERATED_CONFIG } from './generated-config.provider.js';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: GENERATED_CONFIG,
          useValue: {
            cookieSecret: 'some value'
          }
        }
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return config value', () => {
    expect(service.get('cookieSecret')).toEqual('some value');
  });

  it('should return default value', () => {
    expect(service.get('jwtSecret', 'default value')).toEqual('default value');
  });

  it('should throw error if config not initialized', () => {
    service = new ConfigService(null as any);

    expect(() => service.get('cookieSecret')).toThrowError('Config not initialized');
  });

  it('should throw error if config value not set', () => {
    expect(() => service.getOrThrow('jwtSecret')).toThrowError('Config value jwtSecret not set');
  });
});