import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { IsAuthenticated } from './isAuthenticated.guard.js';
import { UsersModule } from '../users/users.module.js';
import { CONFIG_VARS } from '../../utils/config.js';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
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
  providers: [AuthService, IsAuthenticated],
  exports: [AuthService, IsAuthenticated, JwtModule]
})
export class AuthModule { }
