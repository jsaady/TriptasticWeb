import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CheckRoleGuard } from '../../utils/checkRole.js';
import { ConfigModule } from '../../utils/config/config.module.js';
import { ConfigService } from '../../utils/config/config.service.js';
import { EmailModule } from '../email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserClient } from './entities/userClient.entity.js';
import { UserDevice } from './entities/userDevice.entity.js';
import { InviteLinkController } from './inviteLink.controller.js';
import { InviteLinkService } from './inviteLink.service.js';
import { IsAuthenticatedGuard } from './isAuthenticated.guard.js';
import { WebAuthnService } from './webAuthn.service.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserDevice, UserClient]),
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
  controllers: [AuthController, InviteLinkController],
  providers: [InviteLinkService, AuthService, IsAuthenticatedGuard, WebAuthnService, CheckRoleGuard],
  exports: [AuthService, IsAuthenticatedGuard, JwtModule, InviteLinkService],
})
@Global()
export class AuthModule { }
