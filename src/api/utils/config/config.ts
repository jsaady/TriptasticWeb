import { EnvironmentConfig } from './env-config.js';
import { GeneratedConfig } from './generated-config.entity.js';

export const CONFIG_VARS = {
  jwtSecret: 'JWT_SECRET',
  cookieSecret: 'COOKIE_SECRET',
  vapidPublic: 'VAPID_PUBLIC',
  vapidPrivate: 'VAPID_PRIVATE',
  envUrl: 'ENVIRONMENT_URL',
  envName: 'ENVIRONMENT_NAME',
  allowRegistration: 'ALLOW_REGISTRATION',
  emailHost: 'EMAIL_HOST',
  emailPort: 'EMAIL_PORT',
  emailUser: 'EMAIL_USER',
  emailPassword: 'EMAIL_PASSWORD',
  emailReplyTo: 'EMAIL_REPLY_TO',
  requireEmailVerification: 'REQUIRE_EMAIL_VERIFICATION',
  requireMFA: 'REQUIRE_MFA',
  stadiaMapApiKey: 'STADIA_MAP_API_KEY',
  googleCreds: 'GOOGLE_CREDS',
  ninjaApiKey: 'NINJA_API_KEY',
};

export const RATE_LIMIT_TTL = 60;
export const RATE_LIMIT_LIMIT = 10_000;
export const EMAIL_VERIFICATION_EXPIRATION = 300;
export const APP_NAME = 'Triptastic';

export type FullConfig = EnvironmentConfig & GeneratedConfig;
