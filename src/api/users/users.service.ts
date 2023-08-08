import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectPG } from '../db/pg.provider.js';
import { Sql } from 'postgres';
import { compare } from 'bcrypt';
import { User } from './users.entities.js';

@Injectable()
export class UserService {
  constructor (
    @InjectPG() private pg: Sql
  ) { }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const [newUser] = await this.pg`
      INSERT INTO users ${this.pg(user, 'isAdmin', 'username', 'password', 'needPasswordReset', 'email', 'emailConfirmed')}
      RETURNING *
    `;

    return newUser as User;
  }

  async getUserByUserNameOrEmail(usernameOrEmail: string) {
    const [foundUser]: [User|undefined] = await this.pg`
    SELECT * FROM users WHERE username = ${usernameOrEmail} OR email = ${usernameOrEmail}
    `;
    
    return foundUser;
  }
  
  async getUserByUserNameAndEmail(username: string, email: string) {
    const [foundUser]: [User|undefined] = await this.pg`
      SELECT * FROM users WHERE username = ${username} OR email = ${email}
    `;

    return foundUser;
  }
}
