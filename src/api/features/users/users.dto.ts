export class UserDTO {
  gitlabId?: string|number;
  email!: string;
  isAdmin!: boolean;
  needPasswordReset!: boolean;
  emailConfirmed!: boolean;
}

export class CreateUserDTO extends UserDTO {
  password!: string;
}

export class FetchUserDTO extends UserDTO {
  id!: number;
}