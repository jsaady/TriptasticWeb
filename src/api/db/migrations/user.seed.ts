import { hash } from 'bcrypt';
import { Sql } from 'postgres';
import { AUTH_SALT_ROUNDS } from '../../auth/auth.constants.js';
import { User } from '../../users/users.entities.js';

const ROOT_USER: Omit<User, 'id'> = {
  isAdmin: true,
  email: 'root@holyham.cloud',
  username: 'root',
  password: 'root',
  needPasswordReset: true,
  emailConfirmed: true
}

export default {
  name: 'USER_SEED',
  check: async (sql: Sql) => {
    const [{ count }] = await sql`
      SELECT COUNT(*) count FROM users WHERE isAdmin = 1
    `;

    return count === 0;
  },
  up: async (sql: Sql) => {
    ROOT_USER.password = await hash(ROOT_USER.password, AUTH_SALT_ROUNDS)

    await sql`
      INSERT INTO users ${sql(ROOT_USER, 'isAdmin', 'username', 'password', 'needPasswordReset', 'email', 'emailConfirmed')}
    `;

    return true;
  },
  down: async (sql: Sql) => {
    await sql`
      TRUNCATE users
    `;

    return true;
  }
}