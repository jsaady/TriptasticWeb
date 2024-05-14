import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from './users.entity.js';
import { UserService } from './users.service.js';
import { UserAdminController } from './userAdmin.controller.js';
import { UserAdminService } from './userAdmin.service.js';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [UserAdminController],
  providers: [UserService, UserAdminService],
  exports: [UserService]
})
export class UsersModule {}
