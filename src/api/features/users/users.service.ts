import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuthService } from '../auth/auth.service.js';
import { CreateUserDTO } from './users.dto.js';
import { User } from './users.entity.js';

@Injectable()
export class UserService {
  constructor (
    private em: EntityManager
  ) { }

  async create(user: CreateUserDTO): Promise<User> {
    const newUser = this.em.create(User, plainToClass(User, user));
    await this.em.persistAndFlush(newUser);
  
    return newUser;
  }

  getUserById(id: number) {
    return this.em.findOneOrFail(User, {
      id
    });
  }

  async getUserByEmail(email: string) {
    return await this.em.findOne(User, {
      email
    });
  }

  async getUserByUsername(username: string) {
    return await this.em.findOne(User, {
      username
    });
  }

  async updateUser(user: User, updates: Partial<User>) {
    const newUser = wrap(user).assign(updates, { em: this.em });
    await this.em.flush();

    return newUser;
  }
}
