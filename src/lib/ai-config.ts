import type { LlmCapabilities, LlmProviderId } from './llm/types';

export class InvalidAiProviderError extends Error {
  constructor(provider: string) {
    super(`Invalid AI_PROVIDER "${provider}". Expected "gemini" or "nvidia-nim".`);
    this.name = 'InvalidAiProviderError';
  }
}

const PROVIDER_DEFAULTS: Record<LlmProviderId, { displayName: string; model: string; capabilities: LlmCapabilities }> =
  {
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

function resolveEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function getProviderId(): LlmProviderId {
  const raw = resolveEnv(process.env.AI_PROVIDER, 'gemini');
  if (raw === 'gemini' || raw === 'nvidia-nim') return raw;
  throw new InvalidAiProviderError(raw);
}

export type AiConfig = {
  providerId: LlmProviderId;
  provider: string;
  model: string;
  capabilities: LlmCapabilities;
};

export function getAiConfig(): AiConfig {
  const providerId = getProviderId();
  const defaults = PROVIDER_DEFAULTS[providerId];

  return {
    providerId,
    provider: defaults.displayName,
    model: resolveEnv(process.env.AI_MODEL, defaults.model),
    capabilities: defaults.capabilities,
  };
}
