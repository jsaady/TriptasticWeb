import { OmitType } from '@nestjs/swagger';
import { UserRole } from './userRole.enum.js';

export class UserDTO {
  id!: number
  username!: string;
  email!: string;
  role!: UserRole;
  needPasswordReset!: boolean;
  emailConfirmed!: boolean;
  lastLoginDate!: Date | null;
}

export class CreateUserDTO extends OmitType(UserDTO, ['id']) {
  password?: string;
}
