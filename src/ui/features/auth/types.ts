export interface LoginResponse {
  success: boolean;
  code: string;
  data: {
    sub: number;
    email: string;
  }
}
