export class RegisterUserDTO {
  email!: string;
  password!: string;
  clientIdentifier!: string;
}

export class AuthDTO {
  token!: string;
  refreshToken!: string;
  refreshTokenExpiresIn!: number;
}

export interface AuthTokenContents {
  sub: number;
  clientIdentifier: string;
  isAdmin: boolean;
  email: string;
  emailConfirmed: boolean;
  needPasswordReset: boolean;
  mfaEnabled: boolean;
  mfaMethod: string|null;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ResetPasswordDTO {
  currentPassword: string;
  password: string;
}
