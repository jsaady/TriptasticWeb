
export interface User {
  id: number;
  gitlabId?: string|number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  needPasswordReset: boolean;
  emailConfirmed: boolean;
}
