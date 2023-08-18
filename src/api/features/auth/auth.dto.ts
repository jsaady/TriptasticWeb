export class RegisterUserDTO {
  email!: string;
  password!: string;
}

export class AuthDTO {
  token!: string;
  refreshToken!: string;
  refreshTokenExpiresIn!: number;
}

export interface AuthTokenContents {
  sub: number;
  name: string;
  isAdmin: boolean;
  email: string;
  emailConfirmed: boolean;
  needPasswordReset: boolean;
}
