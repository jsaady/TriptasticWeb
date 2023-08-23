import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CONFIG_VARS } from '../../utils/config.js';
import { UsersModule } from '../users/users.module.js';
import { AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { IsAuthenticatedGuard } from './isAuthenticated.guard.js';
import { EmailModule } from '../email/email.module.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserDevice } from './userDevice.entity.js';
import { WebAuthnService } from './webAuthn.service.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserDevice]),
    ConfigModule,
    UsersModule,
    EmailModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.getOrThrow(CONFIG_VARS.jwtSecret),
          signOptions: {
            expiresIn: `${AUTH_TOKEN_EXPIRATION}s`,
            
          }
        }
      },
      inject: [ConfigService],
      imports: [ConfigModule]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, IsAuthenticatedGuard, WebAuthnService],
  exports: [AuthService, IsAuthenticatedGuard, JwtModule]
})
export class AuthModule { }
