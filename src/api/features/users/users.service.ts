import { EntityRepository, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDTO } from './users.dto.js';
import { User } from './users.entity.js';

@Injectable()
export class UserService {
  constructor (
    @InjectRepository(User) private userRepo: EntityRepository<User>
  ) { }

  async create(user: CreateUserDTO): Promise<User> {
    const newUser = this.em.create(User, plainToClass(User, user));
    await this.em.persistAndFlush(newUser);
  
    return newUser;
  }

  getUserById(id: number) {
    return this.userRepo.findOneOrFail({
      id
    });
  }

  async getUserByEmail(email: string) {
    return await this.userRepo.findOne({
      email
    });
  }

  async getUserByUsername(username: string) {
    return await this.userRepo.findOne({
      username
    });
  }
  async updateUser(user: User, updates: Partial<User>) {
    const newUser = wrap(user).assign(updates, { em: this.em });
    await this.em.flush();

    return newUser;
  }

  private get em () {
    return this.userRepo.getEntityManager();
  }
}
