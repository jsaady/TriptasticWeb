import { AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { UserRole } from '../users/userRole.enum.js';

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
  role: UserRole;
  email: string;
  emailConfirmed: boolean;
  needPasswordReset: boolean;
  mfaEnabled: boolean;
  mfaMethod: string|null;
  type: 'auth';
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  clientIdentifier?: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  password: string;
}

export interface AuthStartDTO {
  status: AuthStatus;
  challengeOptions?: PublicKeyCredentialRequestOptionsJSON|PublicKeyCredentialCreationOptionsJSON;
}


export interface AuthRegisterDeviceDTO {
  response: RegistrationResponseJSON;
  clientIdentifier: string;
  username: string;
  password: string;
  deviceName?: string;
}

export interface AuthRegisterDTO {
  response: RegistrationResponseJSON;
  clientIdentifier: string;
  username: string;
  email: string;
  password: string;
  deviceName?: string;
}

export interface AuthLoginDTO {
  response: AuthenticationResponseJSON;
  clientIdentifier: string;
  username: string;
}

export enum AuthStatus {
  registerUser = 'registerUser',
  registerDevice = 'registerDevice',
  verifyEmail = 'verifyEmail',
  login = 'login',
  ok = 'ok'
}
