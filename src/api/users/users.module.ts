import { Module } from '@nestjs/common';
import { UserService } from './users.service.js';
import { DBModule } from '../db/db.module.js';

@Module({
  imports: [DBModule],
  providers: [UserService],
  exports: [UserService]
})
export class UsersModule {}
