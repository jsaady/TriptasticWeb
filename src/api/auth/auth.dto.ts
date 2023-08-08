export class RegisterUserDTO {
  username!: string;
  email!: string;
  password!: string;
}

export class AuthDTO {
  token!: string;
  refreshToken!: string;
  refreshTokenExpiresIn!: number;
}
