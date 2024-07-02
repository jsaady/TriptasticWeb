import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compare, hash } from 'bcrypt';
import { MockConfigModule } from '../../testFixtures/config.mock.js';
import { CreateMikroORM } from '../../testFixtures/mikroOrm.mock.js';
import { EmailService } from '../email/email.service.js';
import { User } from '../users/users.entity.js';
import { UserService } from '../users/users.service.js';
import { AUTH_SALT_ROUNDS } from './auth.constants.js';
import { AuthService } from './auth.service.js';
import { UserClient } from './entities/userClient.entity.js';
import { WebAuthnService } from './webAuthn.service.js';
import { UserRole } from '../users/userRole.enum.js';
import { RequestContextService } from '@nestjs-enhanced/context';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('test'),
  compare: jest.fn(),
}));


describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;
  let orm: MikroORM;

  const mockEmailService: Record<keyof EmailService, jest.Mock> = {
    sendEmail: jest.fn(),
  };
  const mockUserService: Record<keyof UserService, jest.Mock> = {
    getUserById: jest.fn(),
    create: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    updateUser: jest.fn(),
  };
  const mockWebAuthnService: Record<keyof WebAuthnService, jest.Mock> = {
    getDeviceCountByUserId: jest.fn(),
    getDevicesByUserId: jest.fn(),
    removeDeviceById: jest.fn(),
    startWebAuthnRegistration: jest.fn(),
    verifyWebAuthnRegistration: jest.fn(),
    startWebAuthn: jest.fn(),
    verifyWebAuthn: jest.fn(),
  };
  const mockJwtService: Record<keyof JwtService, jest.Mock> = {
    signAsync: jest.fn(),
    sign: jest.fn(),
    verifyAsync: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };
  const mockRequestContextService: Record<keyof RequestContextService, jest.Mock> = {
    start: jest.fn(),
    getContext: jest.fn()
  }
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...CreateMikroORM([UserClient]),
        MockConfigModule,
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: WebAuthnService,
          useValue: mockWebAuthnService,
        },
        {
          provide: RequestContextService,
          useValue: mockRequestContextService
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    orm = module.get<MikroORM>(MikroORM);
  });

  afterEach(() => {
    jest.resetAllMocks();
    return orm.em.nativeDelete(UserClient, {});
  });

  describe('start', () => {

    it('should be able to start authentication if a user exists with devices', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
      });

      mockWebAuthnService.getDeviceCountByUserId.mockResolvedValueOnce(1);
      mockWebAuthnService.startWebAuthn.mockResolvedValueOnce({
        challenge: 'test',
        timeout: 1000,
        rpId: 'test',
        rpName: 'test',
      });

      await expect(service.start('test')).resolves.toEqual({
        status: 'login',
        challengeOptions: {
          challenge: 'test',
          timeout: 1000,
          rpId: 'test',
          rpName: 'test',
        }
      });

      expect(mockUserService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(mockWebAuthnService.getDeviceCountByUserId).toHaveBeenCalled();
      expect(mockWebAuthnService.startWebAuthn).toHaveBeenCalled();
    });

    it('should handle a user not existing', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce(null);
      mockUserService.create.mockResolvedValueOnce({
        id: 2,
        username: 'test',
        email: '',
      });
      mockWebAuthnService.startWebAuthnRegistration.mockResolvedValueOnce({
        challenge: 'test',
        timeout: 1000,
        rpId: 'test',
        rpName: 'test',
      });

      await expect(service.start('test')).resolves.toEqual({
        status: 'registerUser',
        challengeOptions: {
          challenge: 'test',
          timeout: 1000,
          rpId: 'test',
          rpName: 'test',
        }
      });

      expect(mockUserService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(mockUserService.create).toHaveBeenCalledWith({
        username: 'test',
        email: '',
        role: UserRole.USER,
        password: '',
        lastLoginDate: null,
        needPasswordReset: true,
        emailConfirmed: false,
      });
      expect(mockWebAuthnService.startWebAuthnRegistration).toHaveBeenCalledWith(2);
    });

    it('show handle a user not having any devices', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
      });
      mockWebAuthnService.getDeviceCountByUserId.mockResolvedValueOnce(0);
      mockWebAuthnService.startWebAuthnRegistration.mockResolvedValueOnce({
        challenge: 'test',
        timeout: 1000,
        rpId: 'test',
        rpName: 'test',
      });

      await expect(service.start('test')).resolves.toEqual({
        status: 'registerDevice',
        challengeOptions: {
          challenge: 'test',
          timeout: 1000,
          rpId: 'test',
          rpName: 'test',
        }
      });

      expect(mockUserService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(mockWebAuthnService.getDeviceCountByUserId).toHaveBeenCalled();
      expect(mockWebAuthnService.startWebAuthnRegistration).toHaveBeenCalledWith(1);
    });

    it('should handle a user existing with devices trying to add a new device', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
      });
      mockWebAuthnService.getDeviceCountByUserId.mockResolvedValueOnce(1);
      mockWebAuthnService.startWebAuthnRegistration.mockResolvedValueOnce({
        challenge: 'test',
        timeout: 1000,
        rpId: 'test',
        rpName: 'test',
      });

      await expect(service.start('test', true)).resolves.toEqual({
        status: 'registerDevice',
        challengeOptions: {
          challenge: 'test',
          timeout: 1000,
          rpId: 'test',
          rpName: 'test',
        }
      });

      expect(mockUserService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(mockWebAuthnService.getDeviceCountByUserId).toHaveBeenCalled();
      expect(mockWebAuthnService.startWebAuthnRegistration).toHaveBeenCalledWith(1);
    });
  });

  describe('continueDeviceRegistration', () => {
    it('should be able to continue device registration', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
      });
      mockWebAuthnService.verifyWebAuthnRegistration.mockResolvedValueOnce({
        verified: true,
        user: {
          id: 1,
          username: 'test',
          email: '',
        },
      });

      await expect(service.continueDeviceRegistration({ username: 'test', response: ('webauth' as any), deviceName: 'test', password: '', clientIdentifier: '' })).resolves.toEqual({
        id: 1,
        username: 'test',
        email: '',
      });

      expect(mockUserService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(mockWebAuthnService.verifyWebAuthnRegistration).toHaveBeenCalledWith(1, 'test', 'webauth');
    });

    it('should handle if the user does not exist', () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce(null);

      expect(service.continueDeviceRegistration({ username: 'test', response: ({ } as any), deviceName: 'test', password: '', clientIdentifier: '' })).rejects.toThrow('User not found');
    });

    it('should handle if the password is wrong', () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
        password: 'test',
      });

      jest.spyOn(service, 'compareValue' as any).mockResolvedValueOnce(false);

      expect(service.continueDeviceRegistration({ username: 'test', response: ({ } as any), deviceName: 'test', password: 'test2', clientIdentifier: '' })).rejects.toThrow('Incorrect password');
    });

    it('should handle webauthn failing', () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
        password: 'test',
      });
      mockWebAuthnService.verifyWebAuthnRegistration.mockResolvedValueOnce({
        verified: false,
        user: null,
      });

      jest.spyOn(service, 'compareValue' as any).mockResolvedValueOnce(true);

      expect(service.continueDeviceRegistration({ username: 'test', response: ({ } as any), deviceName: 'test', password: 'test', clientIdentifier: '' })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('continueRegistration', () => {
    it('should be able to continue registration', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
      });
      mockWebAuthnService.verifyWebAuthnRegistration.mockResolvedValueOnce({
        verified: true,
        user: {
          id: 1,
          username: 'test',
          email: '',
        },
      });

      await expect(service.continueRegistration({ email: '', username: 'test', response: ({ } as any), password: '', clientIdentifier: '' })).resolves.toEqual({
        id: 1,
        username: 'test',
        email: '',
      });
      
      expect(mockUserService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(mockWebAuthnService.verifyWebAuthnRegistration).toHaveBeenCalledWith(1, 'default', {});
    });
  });

  describe('continueLogin', () => {
    it('should be able to continue login', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
      });
      mockWebAuthnService.verifyWebAuthn.mockResolvedValueOnce({
        verified: true,
        user: {
          id: 1,
          username: 'test',
          email: '',
        },
      });

      await expect(service.continueLogin({ username: 'test', response: ('webauth' as any), clientIdentifier: '' })).resolves.toEqual({
        id: 1,
        username: 'test',
        email: '',
      });

      expect(mockUserService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(mockWebAuthnService.verifyWebAuthn).toHaveBeenCalledWith(1, 'webauth');
    });

    it('should handle if the user does not exist', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce(null);
      await expect(service.continueLogin({ username: 'test', response: ('webauth' as any), clientIdentifier: '' })).rejects.toThrow('User not found');
    });

    it('should handle webauthn failing', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: '',
      });
      mockWebAuthnService.verifyWebAuthn.mockResolvedValueOnce({
        verified: false,
        user: null,
      });

      await expect(service.continueLogin({ username: 'test', response: ('webauth' as any), clientIdentifier: '' })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('initiateEmailVerification', () => {
    it('should be able to initiate email verification with a user argument', async () => {
      mockEmailService.sendEmail.mockResolvedValueOnce(null);
      (hash as jest.Mock).mockResolvedValueOnce('test');

      const user = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
      };
      await expect(service.initiateEmailVerification(user as User, false)).resolves.toBeUndefined();

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith('test@test.com', expect.stringContaining('Verification'), expect.stringContaining(''));
      const [opts] = mockUserService.updateUser.mock.calls;
      expect(opts).toHaveLength(2);
      expect(opts[0]).toEqual(user);
      expect(opts[1]).toMatchObject({
        emailToken: expect.any(String),
        emailTokenDate: expect.any(Date),
      });
    });
  
    it('should be able to initiate email verification (no email date)', async () => {
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
      });
      mockEmailService.sendEmail.mockResolvedValueOnce(null);

      await expect(service.initiateEmailVerification(1, false)).resolves.toBeUndefined();

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith('test@test.com', expect.stringContaining('Verification'), expect.stringContaining(''));
    });

    it('should be able to initiate email verification (email date expired)', async () => {
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        emailTokenDate: new Date(0),
      });
      mockEmailService.sendEmail.mockResolvedValueOnce(null);

      await expect(service.initiateEmailVerification(1, false)).resolves.toBeUndefined();

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith('test@test.com', expect.stringContaining('Verification'), expect.stringContaining(''));
    });

    it('should be able to initiate email verification (force)', async () => {
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        emailTokenDate: new Date(),
      });
      mockEmailService.sendEmail.mockResolvedValueOnce(null);

      await expect(service.initiateEmailVerification(1, true)).resolves.toBeUndefined();

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith('test@test.com', expect.stringContaining('Verification'), expect.stringContaining(''));
    });

    it('should handle if the user does not exist', async () => {
      mockUserService.getUserByUsername.mockResolvedValueOnce(null);
      await expect(service.initiateEmailVerification(1, false)).rejects.toThrow('User not found');
    });

    it('should handle if the email fails to send', async () => {
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
      });

      mockEmailService.sendEmail.mockRejectedValueOnce(new Error('Test'));
      await expect(service.initiateEmailVerification(1, true)).rejects.toThrow('Test');
      expect(mockUserService.updateUser).toHaveBeenCalledWith({
        id: 1,
        username: 'test',
        email: 'test@test.com'
      }, {
        emailToken: null,
        emailTokenDate: null
      });
    });
  });

  describe('validateEmailToken', () => {
    it('should be able to validate an email token', async () => {
      const user = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        emailToken: '123',
        emailTokenDate: new Date(),
      };
      mockUserService.getUserById.mockResolvedValueOnce(user);

      mockUserService.updateUser.mockResolvedValueOnce({ });

      jest.spyOn(service, 'compareValue' as any).mockResolvedValueOnce(true);

      await expect(service.validateEmailToken(1, 'test')).resolves.toEqual({});
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUserService.updateUser).toHaveBeenCalledWith(user, {
        emailConfirmed: true,
        emailToken: null,
        emailTokenDate: null,
      });
    });

    it('should handle if the token does not exist in the database', async () => {
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com'
      });

      await expect(service.validateEmailToken(1, 'test')).rejects.toThrow('No token present');
    });

    it('should handle an expired token', async () => {
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        emailToken: '123',
        emailTokenDate: new Date(0),
      });

      await expect(service.validateEmailToken(1, 'test')).rejects.toThrow('Token expired');
    });

    it('should handle an incorrect token', async () => {
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        emailToken: '123',
        emailTokenDate: new Date(),
      });

      jest.spyOn(service, 'compareValue' as any).mockResolvedValueOnce(false);

      await expect(service.validateEmailToken(1, 'test')).rejects.toThrow('Incorrect token');
    });
  });


  describe('mintDTOForUser', () => {
    it('should return an AuthDTO and AuthTokenContents', async () => {
      const user = {
        id: 1,
        role: UserRole.ADMIN,
        email: 'test@example.com',
        emailConfirmed: true,
        needPasswordReset: false
      } as User;
      const clientIdentifier = 'abc123';
      const mfaMethod = 'sms';

      mockJwtService.signAsync.mockReturnValue('test');

      // Act
      const [authDTO, authTokenContents] = await service.mintDTOForUser(user, clientIdentifier, mfaMethod);

      // Assert
      expect(authDTO.token).toBe('test');
      expect(authDTO.refreshToken).toBe('NOT IMPLEMENTED');
      expect(authDTO.refreshTokenExpiresIn).toBe(0);
      expect(authTokenContents.sub).toBe(user.id);
      expect(authTokenContents.role).toBe(user.role);
      expect(authTokenContents.email).toBe(user.email);
      expect(authTokenContents.emailConfirmed).toBe(user.emailConfirmed);
      expect(authTokenContents.needPasswordReset).toBe(user.needPasswordReset);
      expect(authTokenContents.mfaEnabled).toBeDefined();
      expect(authTokenContents.clientIdentifier).toBe(clientIdentifier);
      expect(authTokenContents.mfaMethod).toBe(mfaMethod);
      expect(authTokenContents.type).toBe('auth');
    });
  });

  describe('checkPasswordForUser', () => {
    it('should return true if the password matches', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com',
        emailConfirmed: true,
        needPasswordReset: false,
      } as User;
      mockUserService.getUserByEmail.mockReturnValue(user);

      jest.spyOn(service, 'compareValue' as any).mockResolvedValueOnce(true);

      const result = await service.checkPasswordForUser(user.email, 'test');

      expect(result).toBe(user);
    });

    it('should handle if the user does not exist', async () => {
      mockUserService.getUserByEmail.mockReturnValue(null);
      jest.spyOn(service, 'compareValue' as any).mockResolvedValueOnce(true);

      await expect(service.checkPasswordForUser('test@test.com', '')).rejects.toThrow('Incorrect email or password');
      expect(service['compareValue']).not.toHaveBeenCalled();
    });

    it('should handle an incorrect password', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com'
      } as User;
  
      mockUserService.getUserByEmail.mockReturnValue(user);
  
      jest.spyOn(service, 'compareValue' as any).mockResolvedValueOnce(false);

      await expect(service.checkPasswordForUser('test@test.com', '')).rejects.toThrow('Incorrect email or password');
      expect(service['compareValue']).toHaveBeenCalled();
    });
  });

  describe('checkUserHasMFA', () => {
    it('should return true if the user has confirmed their email', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com',
        emailConfirmed: true,
      };
      await expect(service.checkUserHasMFA(user as User)).resolves.toBe(true);
    });

    it('should return true if the user has devices', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com',
        emailConfirmed: false,
      };

      mockWebAuthnService.getDeviceCountByUserId.mockResolvedValueOnce(1);

      await expect(service.checkUserHasMFA(user as User)).resolves.toBe(true);

      expect(mockWebAuthnService.getDeviceCountByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('compareValue', () => {
    it('should call bcrypt', async () => {
      (compare as jest.Mock).mockResolvedValueOnce(true);

      await service['compareValue']('test', 'test');

      expect(compare).toHaveBeenCalledWith('test', 'test');
    });
  });

  describe('hashValue', () => {
    it('should call bcrypt', async () => {
      (hash as jest.Mock).mockResolvedValueOnce(true);

      await service['hashValue']('test');

      expect(hash).toHaveBeenCalledWith('test', AUTH_SALT_ROUNDS);
    });
  });

  describe('updatePasswordForUser', () => {
    it('should update the password for a user', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com',
      };

      jest.spyOn(service, 'checkPasswordForUser' as any).mockResolvedValueOnce(user);
      jest.spyOn(service, 'hashValue' as any).mockResolvedValueOnce('hashed');
      mockUserService.updateUser.mockResolvedValueOnce(user);

      await expect(service.updatePasswordForUser(user.email, 'test', 'test')).resolves.toBe(user);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(user, {
        password: 'hashed',
        needPasswordReset: false,
      });
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send a reset password email', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com'
      };

      mockUserService.getUserByEmail.mockResolvedValueOnce(user);
      mockEmailService.sendEmail.mockResolvedValueOnce(null);

      jest.spyOn(service, 'generateResetPasswordToken' as any).mockResolvedValueOnce('token');

      await expect(service.sendResetPasswordEmail(user.email)).resolves.toBeUndefined();

      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(user.email);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(user.email, expect.stringContaining('Reset'), expect.stringContaining('token'));
    });

    it('should handle if the user does not exist', async () => {
      mockUserService.getUserByEmail.mockResolvedValueOnce(null);

      jest.spyOn(Logger, 'log');

      await expect(service.sendResetPasswordEmail('test@test.com')).resolves.toBeUndefined();

      const [message] = (Logger.log as jest.Mock).mock.calls[0];

      expect(message).toMatch('test@test.com');
    });
  });

  describe('generateResetPasswordToken', () => {
    it('should call jwtService', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('test');

      await expect(service['generateResetPasswordToken']('test@test.com')).resolves.toBe('test');

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ type: 'reset_password', email: 'test@test.com' });
    });
  });

  describe('validatePasswordResetToken', () => {
    it('should validate a password reset token', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com'
      };

      mockJwtService.verifyAsync.mockResolvedValueOnce({ email: 'test@test.com', type: 'reset_password' });
      mockUserService.getUserByEmail.mockResolvedValueOnce(user);

      await expect(service['validatePasswordResetToken']('test')).resolves.toBe('test@test.com');
    });

    it('should handle if the user does not exist', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ email: 'test@test.com', type: 'reset_password' });
      mockUserService.getUserByEmail.mockResolvedValueOnce(null);

      await expect(service['validatePasswordResetToken']('test')).rejects.toThrow('User not found');
    });

    it('should handle if the token is not the correct type', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ email: 'test@test.com', type: 'test' });
      mockUserService.getUserByEmail.mockResolvedValueOnce({ username: 'test', email: 'test@test.com' });

      await expect(service['validatePasswordResetToken']('test')).rejects.toThrow('Invalid token type');
    });
  });

  describe('resetPasswordForUser', () => {
    it('should reset the password for a user', async () => {
      const user = {
        id: 1,
        role: UserRole.USER,
        email: 'test@test.com',
      };

      jest.spyOn(service, 'validatePasswordResetToken' as any).mockResolvedValueOnce('test@test.com');
      mockUserService.getUserByEmail.mockResolvedValueOnce(user);
      jest.spyOn(service, 'hashValue' as any).mockResolvedValueOnce('hashed');
      mockUserService.updateUser.mockResolvedValueOnce(user);

      await expect(service.resetPasswordForUser('test', 'test')).resolves.toBe(user);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(user, {
        password: 'hashed',
        needPasswordReset: false,
      });
    });

    it('should handle if the user does not exist', async () => {
      jest.spyOn(service, 'validatePasswordResetToken' as any).mockResolvedValueOnce('test@test.com');
      mockUserService.getUserByEmail.mockResolvedValueOnce(null);

      await expect(service.resetPasswordForUser('test', 'test')).rejects.toThrow('User not found');
    });
  });

  describe('loginUser', () => {
    it('should login a user', async () => {
      jest.spyOn(service, 'checkPasswordForUser' as any).mockResolvedValueOnce({});
      await service.loginUser('', '');

      expect(service['checkPasswordForUser']).toHaveBeenCalled();
    });
  });

  describe('checkUserClientIdentifier', () => {
    it('should return true if the client identifier matches', async () => {
      orm.em.create(UserClient, {
        user: orm.em.getReference(User, 1),
        clientID: 'test'
      });

      await orm.em.flush();

      const exists = await service['checkUserClientIdentifier'](1, 'test');

      expect(exists).toBe(true);
    });

    it('should return false if the client identifier does not match', async () => {
      const exists = await service['checkUserClientIdentifier'](1, 'test does not exist');

      expect(exists).toBe(false);
    });
  });

  describe('registerUserClientIdentifier', () => {
    it('should do an insert', async () => {
      await service.registerUserClientIdentifier(1, 'test2');

      const client = await orm.em.findOneOrFail(UserClient, { user: 1, clientID: 'test2' });

      expect(client).toBeDefined();
    });
  });

  afterAll(async () => {
    await module?.close();
  });
});
