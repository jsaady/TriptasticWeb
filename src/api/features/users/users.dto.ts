import { UserRole } from './userRole.enum.js';

export class UserDTO {
  gitlabId?: string|number;
  username!: string;
  email!: string;
  role!: UserRole;
  needPasswordReset!: boolean;
  emailConfirmed!: boolean;
}

export class CreateUserDTO extends UserDTO {
  password!: string;
}

export class FetchUserDTO extends UserDTO {
  id!: number;
}