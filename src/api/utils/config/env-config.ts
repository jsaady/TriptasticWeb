export interface EnvironmentConfig {
  envUrl: string;
  envName: string;
  emailHost: string;
  emailPort: string;
  emailUser: string;
  emailPassword: string;
  emailReplyTo: string;
  ollamaUrl: string;
  ollamaChatModel: string;
  ollamaEmbeddingModel: string;
  openaiUrl: string;
  openaiKey: string;
  openaiChatModel: string;
  openaiEmbeddingModel: string;
  relevantNoteWindowSize: number;
}
