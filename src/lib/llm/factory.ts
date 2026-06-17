import { getAiConfig } from '../ai-config';
import { createGeminiProvider } from './gemini-provider';
import { createNvidiaNimProvider } from './nvidia-nim-provider';
import type { LlmProvider } from './types';

let cachedProvider: LlmProvider | null = null;

function resolveEnv(value: string | undefined): string {
  return value?.trim() ?? '';
}

export function getLlmProvider(): LlmProvider {
  if (cachedProvider) return cachedProvider;

  const config = getAiConfig();

  if (config.providerId === 'gemini') {
    const apiKey = resolveEnv(process.env.GEMINI_API_KEY);
    if (!apiKey) throw new Error('GEMINI_API_KEY not found in environment variables.');
    cachedProvider = createGeminiProvider({ apiKey, model: config.model });
    return cachedProvider;
  }

  const apiKey = resolveEnv(process.env.NVIDIA_API_KEY);
  if (!apiKey) throw new Error('NVIDIA_API_KEY not found in environment variables.');
  cachedProvider = createNvidiaNimProvider({ apiKey, model: config.model });
  return cachedProvider;
}

export function resetLlmProviderForTests(): void {
  cachedProvider = null;
}
