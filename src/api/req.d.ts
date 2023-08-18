import { AuthTokenContents } from './features/users/users.dto.ts';
declare module 'express' {
  interface Request {
    user: AuthTokenContents;
  }
}
