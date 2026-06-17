import type { LlmCapabilities, LlmProviderId } from './llm/types';
import { filterHostedNvidiaModels, isNvidiaModelHosted } from './llm/nvidia-nim-catalog';

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
  'nvidia-nim': filterHostedNvidiaModels([
    { id: 'nvidia/nvidia-nemotron-nano-9b-v2', label: 'Nemotron Nano 9B v2 (rápido)' },
    { id: 'meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B Instruct (rápido)' },
    { id: 'nvidia/nemotron-mini-4b-instruct', label: 'Nemotron Mini 4B Instruct (rápido)' },
    { id: 'meta/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
    { id: 'meta/llama-3.1-70b-instruct', label: 'Llama 3.1 70B Instruct' },
    { id: 'mistralai/mixtral-8x7b-instruct-v0.1', label: 'Mixtral 8x7B Instruct' },
  ]),
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

export function parseProviderId(value: string): LlmProviderId {
  if (value === 'gemini' || value === 'nvidia-nim') return value;
  throw new InvalidAiProviderError(value);
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
  if (!trimmed) return models;

  const isKnown = models.some((model) => model.id === trimmed);
  const isLegacyNvidia = providerId === 'nvidia-nim' && !isNvidiaModelHosted(trimmed);
  if (!isKnown && !isLegacyNvidia) {
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
