import type { LlmCapabilities, LlmProviderId } from './llm/types';

export class InvalidAiProviderError extends Error {
  constructor(provider: string) {
    super(`Invalid AI_PROVIDER "${provider}". Expected "gemini" or "nvidia-nim".`);
    this.name = 'InvalidAiProviderError';
  }
}

export type ModelOption = {
  id: string;
  label: string;
};

export const PROVIDER_MODELS: Record<LlmProviderId, ModelOption[]> = {
  gemini: [
    { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  ],
  'nvidia-nim': [
    { id: 'qwen/qwen2.5-72b-instruct', label: 'Qwen 2.5 72B Instruct' },
    { id: 'meta/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
    { id: 'mistralai/mistral-large', label: 'Mistral Large' },
    { id: 'qwen/qwq-32b', label: 'QwQ 32B' },
    { id: 'meta/llama-3.1-70b-instruct', label: 'Llama 3.1 70B Instruct' },
    { id: 'nvidia/nemotron-4-340b-instruct', label: 'Nemotron 4 340B Instruct' },
    { id: 'google/gemma-2-27b-it', label: 'Gemma 2 27B IT' },
    { id: 'deepseek-ai/deepseek-r1-distill-llama-8b', label: 'DeepSeek R1 Distill Llama 8B' },
    { id: 'google/gemma-2-9b-it', label: 'Gemma 2 9B IT' },
    { id: 'meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B Instruct' },
    { id: 'microsoft/phi-3-medium-128k-instruct', label: 'Phi-3 Medium 128K' },
    { id: 'mistralai/mixtral-8x7b-instruct-v0.1', label: 'Mixtral 8x7B Instruct' },
    { id: 'nvidia/nvidia-nemotron-nano-9b-v2', label: 'Nemotron Nano 9B v2' },
    { id: 'microsoft/phi-3-mini-128k-instruct', label: 'Phi-3 Mini 128K' },
    { id: 'mistralai/mistral-7b-instruct-v0.3', label: 'Mistral 7B Instruct' },
    { id: 'nvidia/nemotron-mini-4b-instruct', label: 'Nemotron Mini 4B Instruct' },
  ],
};

export const PROVIDER_DEFAULTS: Record<
  LlmProviderId,
  { displayName: string; model: string; capabilities: LlmCapabilities }
> = {
  gemini: {
    displayName: 'Google Gemini',
    model: PROVIDER_MODELS.gemini[0].id,
    capabilities: { structuredJson: true, webGrounding: true },
  },
  'nvidia-nim': {
    displayName: 'NVIDIA NIM',
    model: PROVIDER_MODELS['nvidia-nim'][0].id,
    capabilities: { structuredJson: true, webGrounding: false },
  },
};

export type UserAiPreferences = {
  providerId: LlmProviderId;
  model: string | null;
};

export type ProviderOption = {
  id: LlmProviderId;
  displayName: string;
  defaultModel: string;
  models: ModelOption[];
  capabilities: LlmCapabilities;
  configured: boolean;
};

function resolveEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function parseProviderId(value: string): LlmProviderId {
  if (value === 'gemini' || value === 'nvidia-nim') return value;
  throw new InvalidAiProviderError(value);
}

export function getProviderId(): LlmProviderId {
  const raw = resolveEnv(process.env.AI_PROVIDER, 'gemini');
  return parseProviderId(raw);
}

export type AiConfig = {
  providerId: LlmProviderId;
  provider: string;
  model: string;
  capabilities: LlmCapabilities;
};

export function getModelsForProvider(providerId: LlmProviderId, currentModel?: string | null): ModelOption[] {
  const models = PROVIDER_MODELS[providerId];
  const trimmed = currentModel?.trim();
  if (trimmed && !models.some((model) => model.id === trimmed)) {
    return [{ id: trimmed, label: trimmed }, ...models];
  }
  return models;
}

export function buildAiConfig(providerId: LlmProviderId, model: string): AiConfig {
  const defaults = PROVIDER_DEFAULTS[providerId];
  return {
    providerId,
    provider: defaults.displayName,
    model,
    capabilities: defaults.capabilities,
  };
}

export function getAiConfig(): AiConfig {
  const providerId = getProviderId();
  const defaults = PROVIDER_DEFAULTS[providerId];
  return buildAiConfig(providerId, resolveEnv(process.env.AI_MODEL, defaults.model));
}

export function resolveAiConfig(preferences: UserAiPreferences | null | undefined): AiConfig {
  if (!preferences?.providerId) return getAiConfig();

  const providerId = preferences.providerId;
  const defaults = PROVIDER_DEFAULTS[providerId];
  const model = preferences.model?.trim() || defaults.model;
  return buildAiConfig(providerId, model);
}

export function isProviderConfigured(providerId: LlmProviderId): boolean {
  if (providerId === 'gemini') return Boolean(process.env.GEMINI_API_KEY?.trim());
  return Boolean(process.env.NVIDIA_API_KEY?.trim());
}

export function listProviderOptions(): ProviderOption[] {
  return (Object.keys(PROVIDER_DEFAULTS) as LlmProviderId[]).map((id) => {
    const defaults = PROVIDER_DEFAULTS[id];
    return {
      id,
      displayName: defaults.displayName,
      defaultModel: defaults.model,
      models: PROVIDER_MODELS[id],
      capabilities: defaults.capabilities,
      configured: isProviderConfigured(id),
    };
  });
}

export function getProviderApiKeyError(providerId: LlmProviderId): string | null {
  if (isProviderConfigured(providerId)) return null;
  return providerId === 'gemini'
    ? 'GEMINI_API_KEY not found in environment variables.'
    : 'NVIDIA_API_KEY not found in environment variables.';
}
