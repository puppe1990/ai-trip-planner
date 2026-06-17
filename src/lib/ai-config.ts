import type { LlmCapabilities, LlmProviderId } from './llm/types';

export class InvalidAiProviderError extends Error {
  constructor(provider: string) {
    super(`Invalid AI_PROVIDER "${provider}". Expected "gemini" or "nvidia-nim".`);
    this.name = 'InvalidAiProviderError';
  }
}

export const PROVIDER_DEFAULTS: Record<
  LlmProviderId,
  { displayName: string; model: string; capabilities: LlmCapabilities }
> = {
  gemini: {
    displayName: 'Google Gemini',
    model: 'gemini-3.5-flash',
    capabilities: { structuredJson: true, webGrounding: true },
  },
  'nvidia-nim': {
    displayName: 'NVIDIA NIM',
    model: 'meta/llama-3.3-70b-instruct',
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
  capabilities: LlmCapabilities;
  configured: boolean;
};

function resolveEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function resolveEnvOptional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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
