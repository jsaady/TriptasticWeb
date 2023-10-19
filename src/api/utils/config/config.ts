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
  emailReplyTo: 'EMAIL_REPLY_TO',
  ollamaUrl: 'OLLAMA_URL',
  ollamaChatModel: 'OLLAMA_CHAT_MODEL',
  ollamaEmbeddingModel: 'OLLAMA_EMBEDDING_MODEL',
  openaiUrl: 'OPENAI_URL',
  openaiKey: 'OPENAI_KEY',
  openaiChatModel: 'OPENAI_CHAT_MODEL',
  openaiEmbeddingModel: 'OPENAI_EMBEDDING_MODEL'
};

export const RATE_LIMIT_TTL = 60;
export const RATE_LIMIT_LIMIT = 10_000;
export const EMAIL_VERIFICATION_EXPIRATION = 300;
export const APP_NAME = 'Runner';
export const MFA_ENABLED = true;

export type FullConfig = EnvironmentConfig & GeneratedConfig;
