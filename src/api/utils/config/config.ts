import { EnvironmentConfig } from './env-config.js';
import { GeneratedConfig } from './generated-config.entity.js';

export const CONFIG_VARS = {
  jwtSecret: 'JWT_SECRET',
  cookieSecret: 'COOKIE_SECRET',
  vapidPublic: 'VAPID_PUBLIC',
  vapidPrivate: 'VAPID_PRIVATE',
  envUrl: 'ENVIRONMENT_URL',
  envName: 'ENVIRONMENT_NAME',
  emailHost: 'EMAIL_HOST',
  emailPort: 'EMAIL_PORT',
  emailUser: 'EMAIL_USER',
  emailPassword: 'EMAIL_PASSWORD',
  emailReplyTo: 'EMAIL_REPLY_TO'
};

export const RATE_LIMIT_TTL = 60;
export const RATE_LIMIT_LIMIT = 100;
export const EMAIL_VERIFICATION_EXPIRATION = 300;
export const APP_NAME = 'Runner';
export const MFA_ENABLED = true;

export type FullConfig = EnvironmentConfig & GeneratedConfig;
