export const CONFIG_VARS = {
  jwtSecret: 'JWT_SECRET',
  cookieSecret: 'COOKIE_SECRET',
  vapidPublic: 'VAPID_PUBLIC',
  vapidPrivate: 'VAPID_PRIVATE',
  vapidSubject: 'VAPID_SUBJECT',
  envUrl: 'GITLAB_ENVIRONMENT_URL',
  envName: 'GITLAB_ENVIRONMENT_NAME',
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