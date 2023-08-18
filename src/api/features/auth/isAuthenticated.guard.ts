import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CONFIG_VARS } from '../../utils/config.js';
import { AuthDTO, AuthTokenContents } from './auth.dto.js';

@Injectable()
export class IsAuthenticated implements CanActivate {
  constructor (
    private jwt: JwtService,
    private configService: ConfigService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwt.verifyAsync<AuthTokenContents>(
        token.token,
        {
          secret: this.configService.getOrThrow(CONFIG_VARS.jwtSecret)
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): AuthDTO | undefined {
    const rawToken = request.signedCookies['Authorization'];

    if (rawToken) {
      const serializedToken = Buffer.from(rawToken, 'base64').toString('utf-8');

      const parsedToken = JSON.parse(serializedToken);

      return parsedToken;
    }
  }
}