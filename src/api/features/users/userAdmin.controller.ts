import { BadRequestException, Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { User } from '../auth/user.decorator.js';
import { AuthTokenContents } from '../auth/auth.dto.js';
import { UserRole } from './userRole.enum.js';
import { UserService } from './users.service.js';

@Controller('user-admin')
@IsAuthenticated()
export class UserAdminController {
  constructor(
    private userService: UserService
  ) { }

  @Post('updateRole')
  async updateRole(
    @User() user: AuthTokenContents,
    @Body('userId') userId: number
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    if (user.sub === userId) {
      throw new BadRequestException('Cannot update own role');
    }

    await this.userService.updateRole(userId, UserRole.ADMIN);
  }
}
