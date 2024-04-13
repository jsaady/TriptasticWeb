import { Request } from 'express';
import { AuthTokenContents } from './auth.dto.js';

export interface AuthenticatedRequest extends Request {
  user: AuthTokenContents;
}
