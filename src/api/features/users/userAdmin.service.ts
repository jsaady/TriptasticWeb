import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuthService } from '../auth/auth.service.js';
import { CreateUserDTO, UserDTO } from './users.dto.js';
import { User } from './users.entity.js';
import { UserService } from './users.service.js';

@Injectable()
export class UserAdminService {
  constructor (
    private em: EntityManager,
    private auth: AuthService
  ) { }

  async createUser(user: CreateUserDTO): Promise<UserDTO> {
    const newUser = this.em.create(User, plainToClass(User, user));
    const password = newUser.password;
    newUser.password = '';
    
    await this.em.persistAndFlush(newUser);

    await this.auth.setTempPasswordForUser(newUser, password);

    return plainToClass(UserDTO, newUser);
  }

  async findAll(): Promise<UserDTO[]> {
    const currentUserId = this.auth.getCurrentUserId();

    const users = await this.em.find(User, { id: { $ne: currentUserId } });

    return users.map(user => plainToClass(UserDTO, user));
  }

  async update(id: string, user: CreateUserDTO): Promise<UserDTO> {
    const newPassword = user.password;
    delete user.password;

    const existingUser = await this.em.findOne(User, +id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    wrap(existingUser).assign(user);

    await this.em.flush();

    if (newPassword) {
      await this.auth.setTempPasswordForUser(existingUser, newPassword);
    }

    return plainToClass(UserDTO, existingUser);
  }

  async deleteUser (id: number) {
    const user = await this.em.findOneOrFail(User, id);

    await this.em.removeAndFlush(user);

    return plainToClass(UserDTO, user);
  }
}
