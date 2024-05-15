import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put } from '@nestjs/common';
import { User } from '../auth/user.decorator.js';
import { AuthTokenContents } from '../auth/auth.dto.js';
import { UserRole } from './userRole.enum.js';
import { UserService } from './users.service.js';
import { HasRole } from '../../utils/checkRole.js';
import { CreateUserDTO } from './users.dto.js';
import { UserAdminService } from './userAdmin.service.js';

@Controller('admin/user')
@HasRole(UserRole.ADMIN)
export class UserAdminController {
  constructor(
    private userService: UserService,
    private userAdminService: UserAdminService
  ) { }

  @Get()
  async getUsers() {
    return this.userAdminService.findAll();
  }

  @Post()
  async createUser(
    @Body() user: CreateUserDTO
  ) {
    return this.userService.create(user);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: CreateUserDTO,
    @User() currentUser: AuthTokenContents
  ) {
    if (+currentUser.sub === +id && user.role !== currentUser.role) {
      throw new ForbiddenException('Cannot change own role');
    }

    return this.userAdminService.update(id, user);
  }

  @Delete(':id')
  async deleteUser(
    @User() user: AuthTokenContents,
    @Param('id') id: number
  ) {
    if (+user.sub == +id) {
      throw new ForbiddenException('Cannot delete self');
    }

    return this.userAdminService.deleteUser(id);
  }
}
