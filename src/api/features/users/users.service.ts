import { EntityRepository, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDTO } from './users.dto.js';
import { User } from './users.entity.js';
import { UserRole } from './userRole.enum.js';

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

  async updateRole(userId: number, role: UserRole) {
    const user = await this.getUserById(userId);
    user.role = role;
  
    await this.em.flush();

    return user;
  }

  private get em () {
    return this.userRepo.getEntityManager();
  }
}
