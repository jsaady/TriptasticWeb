import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDTO } from './users.dto.js';
import { User } from './users.entity.js';

@Injectable()
export class UserService {
  constructor (
    private em: EntityManager
  ) { }

  async create(user: CreateUserDTO): Promise<User> {
    const newUser = this.em.create(User, plainToClass(User, {
      ...user,
      username: user.username.toLowerCase(),
      email: user.email.toLowerCase()
    }));
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
      email: email.toLowerCase(),
    });
  }

  async getUserByUsername(username: string) {
    return await this.em.findOne(User, {
      username: username.toLowerCase()
    });
  }

  async updateUser(user: User, updates: Partial<User>) {
    if (updates.username) {
      updates.username = updates.username.toLowerCase();
    }
    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const newUser = wrap(user).assign(updates, { em: this.em });
    await this.em.flush();

    return newUser;
  }
}
