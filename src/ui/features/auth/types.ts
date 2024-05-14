import { AuthTokenContents } from '@api/features/auth/auth.dto.js';

export interface LoginResponse {
  success: boolean;
  code: string;
  data: AuthTokenContents;
}
