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
  isAdmin: boolean;
  email: string;
  emailConfirmed: boolean;
  needPasswordReset: boolean;
  mfaEnabled: boolean;
  mfaMethod?: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ResetPasswordDTO {
  currentPassword: string;
  password: string;
}
