import { EntityRepository } from '@mikro-orm/core';
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

  async createUser(user: CreateUserDTO): Promise<User> {
    const newUser = this.userRepo.getEntityManager().create(User, plainToClass(User, user));
    await this.userRepo.getEntityManager().insert(User, newUser);
  
    return newUser;
  }

  async getUserByEmail(email: string) {
    const foundUser = await this.userRepo.findOne({
      email
    });

    return foundUser;
  }
}
