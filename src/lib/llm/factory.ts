import type { AiConfig } from '../ai-config';
import { getAiConfig } from '../ai-config.server';
import { createGeminiProvider } from './gemini-provider';
import { createNvidiaNimProvider } from './nvidia-nim-provider';
import type { LlmProvider } from './types';

const cache = new Map<string, LlmProvider>();

function resolveEnv(value: string | undefined): string {
  return value?.trim() ?? '';
}

function cacheKey(config: AiConfig): string {
  return `${config.providerId}:${config.model}`;
}

export function getLlmProvider(config: AiConfig = getAiConfig()): LlmProvider {
  const key = cacheKey(config);
  const cached = cache.get(key);
  if (cached) return cached;

  if (config.providerId === 'gemini') {
    const apiKey = resolveEnv(process.env.GEMINI_API_KEY);
    if (!apiKey) throw new Error('GEMINI_API_KEY not found in environment variables.');
    const provider = createGeminiProvider({ apiKey, model: config.model });
    cache.set(key, provider);
    return provider;
  }

  const apiKey = resolveEnv(process.env.NVIDIA_API_KEY);
  if (!apiKey) throw new Error('NVIDIA_API_KEY not found in environment variables.');
  const provider = createNvidiaNimProvider({ apiKey, model: config.model });
  cache.set(key, provider);
  return provider;
}

export function resetLlmProviderForTests(): void {
  cache.clear();
}
