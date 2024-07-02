import { Test, TestingModule } from '@nestjs/testing';
import { IsAuthenticatedGuard } from './isAuthenticated.guard.js';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import { InviteLinkService } from './inviteLink.service.js';
import { ConfigService } from '../../utils/config/config.service.js';

describe('IsAuthenticatedGuard', () => {
  let guard: IsAuthenticatedGuard;
  let mockConfigService: Partial<Record<keyof ConfigService, jest.Mock>>;
  let mockReflector: Partial<Record<keyof Reflector, jest.Mock>>;
  let mockAuthService: Partial<Record<keyof AuthService, jest.Mock>>;
  let mockInviteLinkService: Partial<Record<keyof InviteLinkService, jest.Mock>>;

  beforeEach(async () => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    mockAuthService = {
      extractAuthDtoFromRequest: jest.fn(),
    };
    mockInviteLinkService = {
      extractInviteCodeFromRequest: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsAuthenticatedGuard,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Reflector, useValue: mockReflector },
        { provide: AuthService, useValue: mockAuthService },
        { provide: InviteLinkService, useValue: mockInviteLinkService },
      ],
    }).compile();

    guard = module.get<IsAuthenticatedGuard>(IsAuthenticatedGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if SKIP_AUTH is true', async () => {
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? true : false);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(1);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('SKIP_AUTH_CHECK', expect.any(Array));
    });

    it('should allow invite code', async () => {
      const request = { user: {} };
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? null : false);
      const fakeUser = { clientIdentifier: 'test' };
      mockInviteLinkService.extractInviteCodeFromRequest?.mockResolvedValueOnce(fakeUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockInviteLinkService.extractInviteCodeFromRequest).toHaveBeenCalledTimes(1);
      expect(request.user).toEqual(fakeUser);
    });

    it('should not allow if no user is on request', async () => {
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? null : false);
      mockAuthService.extractAuthDtoFromRequest?.mockResolvedValueOnce(null);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should not allow a user if they need a password reset', async () => {
      const request = { user: { needPasswordReset: true, sub: 'test' } };
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? null : false);
      mockAuthService.extractAuthDtoFromRequest?.mockResolvedValueOnce(request.user);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should not allow a user if they have an unverified email', async () => {
      const request = { user: { emailConfirmed: false, sub: 'test' } };
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? null : false);
      mockAuthService.extractAuthDtoFromRequest?.mockResolvedValueOnce(request.user);
      mockConfigService.get?.mockReturnValueOnce(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should not allow a user if they need MFA', async () => {
      const request = {
        user: {
          emailConfirmed: true,
          needPasswordReset: false,
          mfaEnabled: false,
          mfaMethod: false,
          sub: 'test'
        }
      };
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? null : false);
      mockAuthService.extractAuthDtoFromRequest?.mockResolvedValueOnce(request.user);
      mockConfigService.get?.mockReturnValueOnce(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should throw an error if an error occurs', async () => {
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? null : false);
      mockAuthService.extractAuthDtoFromRequest?.mockRejectedValueOnce(new Error('Test Error'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should return true if no errors occur', async () => {
      const request = {
        user: {
          sub: 'test',
          emailConfirmed: true,
          mfaEnabled: true,
          mfaMethod: 'true',
          needPasswordReset: false,
        }
      };
      const context: ExecutionContext = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      mockReflector.getAllAndOverride?.mockImplementationOnce((key, _) => key === 'SKIP_AUTH_CHECK' ? null : false);
      mockAuthService.extractAuthDtoFromRequest?.mockResolvedValueOnce(request.user);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});