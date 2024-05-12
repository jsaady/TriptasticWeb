export interface EnvironmentConfig {
  envUrl: string;
  envName: string;
  emailHost: string;
  emailPort: string;
  emailUser: string;
  emailPassword: string;
  emailReplyTo: string;
  requireEmailVerification: boolean;
  requireMFA: boolean;
  stadiaMapApiKey: string;
}
