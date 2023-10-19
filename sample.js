import { LocalLlamaChatService } from './dist/api/features/ai/local/local-llama-chat.service.js';

const s = new LocalLlamaChatService();

(async () => {
  for await (const item of s.getReplyStream('Here here', `In this interaction, prioritize providing concise, clear, and directly relevant answers to the user's queries. Your primary role is to assist, inform, and clarify. Ensure that the information given is reliable and accurate. Avoid drifting into tangential topics unless explicitly asked. If a question seems ambiguous, seek clarity before offering an answer. Always aim for user satisfaction by being a useful and responsive chatbot.`)) {
    process.stdout.write(item);
  }
})();
