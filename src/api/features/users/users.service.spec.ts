import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfigModule } from '../../testFixtures/config.mock.js';
import { CreateMikroORM } from '../../testFixtures/mikroOrm.mock.js';
import { User } from './users.entity.js';
import { UserService } from './users.service.js';
import { CreateUserDTO } from './users.dto.js';

const generateMockUser = (email = 'test@test.com', password = '', username = 'test'): CreateUserDTO => ({
  email,
  password,
  username,
  isAdmin: false,
  needPasswordReset: false,
  emailConfirmed: false,
});

describe('UserService', () => {
  let module: TestingModule;
  let service: UserService;
  let orm: MikroORM;


  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...CreateMikroORM([User]),
        MockConfigModule,
      ],
      providers: [
        UserService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    orm = module.get<MikroORM>(MikroORM);
  });

  afterAll(async () => {
    await module?.close();
  });

  afterEach(() => {
    return orm.em.nativeDelete(User, {
      id: {
        $gt: 1,
      }
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = await service.createUser(generateMockUser());

      expect(user).toMatchObject({
        email: 'test@test.com',
        password: '',
      });

      const userFromDb = await orm.em.findOne(User, user.id);
      expect(userFromDb).toMatchObject({
        email: 'test@test.com',
        password: '',
      });
    });

    it('should hash the password', async () => {
      const user = await service.createUser(generateMockUser());

      expect(user).toMatchObject({
        email: 'test@test.com',
        password: expect.not.stringMatching('test'),
      });
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await service.createUser(generateMockUser());

      const foundUser = await service.getUserByEmail(user.email);
      expect(foundUser).toMatchObject({
        email: 'test@test.com',
        password: '',
      });

      const userFromDb = await orm.em.findOne(User, user.id);
      expect(userFromDb).toMatchObject({
        email: 'test@test.com',
        password: '',
      });

      expect(foundUser).toEqual(userFromDb);
    });

    it('should return null if no user is found', async () => {
      const foundUser = await service.getUserByEmail('test@test.com');

      expect(foundUser).toBeNull();
    });
  });
});

