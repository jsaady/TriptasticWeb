import { CanActivate, ExecutionContext, Injectable, Logger, SetMetadata, UnauthorizedException, UseGuards, applyDecorators } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import { AuthenticatedRequest } from './authenticated-request.type.js';
import { ConfigService } from '../../utils/config/config.service.js';
import { InviteLinkService } from './inviteLink.service.js';
const IS_AUTH_CONFIG = 'IS_AUTH_CONFIG';
const SKIP_AUTH_CHECK = 'SKIP_AUTH_CHECK';

export interface IsAuthenticatedConfig {
  allowExpiredPassword?: boolean;
  allowUnverifiedEmail?: boolean;
  allowNoMFA?: boolean;
}

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
  logger = new Logger('IsAuthenticatedGuard');

  constructor (
    private config: ConfigService,
    private reflector: Reflector,
    private authService: AuthService,
    private inviteLinkService: InviteLinkService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const skipAuthCheck = this.reflector.getAllAndOverride(SKIP_AUTH_CHECK, [context.getClass(), context.getHandler()]) ?? false;

    if (skipAuthCheck) return true;

    const { allowExpiredPassword = false, allowUnverifiedEmail = false, allowNoMFA = false } = this.reflector.getAllAndOverride<IsAuthenticatedConfig>(IS_AUTH_CONFIG, [context.getClass(), context.getHandler()]) ?? {};

    try {
      const inviteContents = await this.inviteLinkService.extractInviteCodeFromRequest(request);

      if (inviteContents) {
        this.logger.log(`Invite code ${inviteContents.clientIdentifier} found in request`);

        request.user = inviteContents;

        return true;
      }

      const payload = await this.authService.extractAuthDtoFromRequest(request);
      if (!payload) {
        throw new UnauthorizedException();
      }
      request.user = payload;

      if (!allowExpiredPassword && payload.needPasswordReset) {
        this.logger.log(`User ${payload.sub} needs password reset`);
        return false;
      }

      if (this.config.get('requireEmailVerification') && !allowUnverifiedEmail && !payload.emailConfirmed) {
        this.logger.log(`User ${payload.sub} has unverified email`);
        return false;
      }

      if (this.config.get('requireMFA') && !allowNoMFA && (!payload.mfaEnabled || !payload.mfaMethod)) {
        this.logger.log(`User ${payload.sub} needs MFA`);

        return false;
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}

export const IsAuthenticated = (c: IsAuthenticatedConfig = { allowExpiredPassword: false, allowUnverifiedEmail: false }) => applyDecorators(UseGuards(IsAuthenticatedGuard), SetMetadata(IS_AUTH_CONFIG, c));
export const AllowUnauthenticated = () => SetMetadata(SKIP_AUTH_CHECK, true);
