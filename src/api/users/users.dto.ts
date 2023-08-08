export class UserDTO {
  id!: number;
  gitlabId?: string|number;
  username!: string;
  email!: string;
  isAdmin!: boolean;
  needPasswordReset!: boolean;
  emailConfirmed!: boolean;
}
