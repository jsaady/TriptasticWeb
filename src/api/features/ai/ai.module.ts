import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '../../utils/config/config.module.js';
import { CHAT_SERVICE } from './chat.service.js';
import { EMBEDDINGS_SERVICE } from './embeddings.service.js';
import { LocalBertEmbeddingService } from './local/local-bert-embedding.service.js';
import { OllamaChatService } from './ollama/ollama-chat.service.js';
import { OllamaEmbeddingsService } from './ollama/ollama-embeddings.service.js';
import { OpenAIChatService } from './openai/openai-chat.service.js';
import { OpenAIEmbeddingsService } from './openai/openai-embeddings.service.js';
import { LocalLlamaChatService } from './local/local-llama-chat.service.js';

export enum AIProvider {
  openai = 'openai',
  ollama = 'ollama',
  local = 'local'
}

export interface AIModuleConfig {
  embedding: AIProvider;
  chat: AIProvider;
}

const getEmbeddingProvider = (provider: AIProvider): Provider => ({
  provide: EMBEDDINGS_SERVICE,
  useClass: provider === AIProvider.ollama ?
    OllamaEmbeddingsService : provider === AIProvider.local ? LocalBertEmbeddingService :
    OpenAIEmbeddingsService
});
const getChatProvider = (provider: AIProvider): Provider => ({
  provide: CHAT_SERVICE,
  useClass: provider === AIProvider.ollama ?
    OllamaChatService : provider === AIProvider.local ? LocalLlamaChatService :
    OpenAIChatService
});


@Module({ })
export class AiModule {
  static forRoot (
    providerOrConfig: AIProvider|AIModuleConfig
  ): DynamicModule {
    const embeddingProvider = getEmbeddingProvider(
      typeof(providerOrConfig) === 'string' ?
        providerOrConfig :
        providerOrConfig.embedding
    );
    const chatProvider = getChatProvider(
      typeof(providerOrConfig) === 'string' ?
        providerOrConfig :
        providerOrConfig.chat
    )
    return {
      global: true,
      module: AiModule,
      imports: [ConfigModule],
      providers: [embeddingProvider, chatProvider],
      exports: [embeddingProvider, chatProvider]
    };
  }
}
