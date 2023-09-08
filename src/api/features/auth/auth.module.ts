import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../../utils/config/config.module.js';
import { EmailModule } from '../email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { IsAuthenticatedGuard } from './isAuthenticated.guard.js';
import { UserDevice } from './userDevice.entity.js';
import { WebAuthnService } from './webAuthn.service.js';
import { ConfigService } from '../../utils/config/config.service.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserDevice]),
    ConfigModule,
    UsersModule,
    EmailModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.getOrThrow('jwtSecret'),
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
