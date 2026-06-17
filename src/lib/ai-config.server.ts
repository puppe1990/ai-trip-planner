import 'dotenv/config';
import {
  buildAiConfig,
  parseProviderId,
  PROVIDER_DEFAULTS,
  PROVIDER_MODELS,
  type AiConfig,
  type ProviderOption,
  type UserAiPreferences,
} from './ai-config';
import type { LlmProviderId } from './llm/types';
import { isNvidiaModelHosted } from './llm/nvidia-nim-catalog';

function resolveEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function isProviderConfigured(providerId: LlmProviderId): boolean {
  if (providerId === 'gemini') return Boolean(process.env.GEMINI_API_KEY?.trim());
  return Boolean(process.env.NVIDIA_API_KEY?.trim());
}

export function getConfiguredProviderIds(): LlmProviderId[] {
  return (Object.keys(PROVIDER_DEFAULTS) as LlmProviderId[]).filter(isProviderConfigured);
}

export function getProviderId(): LlmProviderId {
  const envRaw = process.env.AI_PROVIDER?.trim();
  if (envRaw) {
    const envProvider = parseProviderId(envRaw);
    if (isProviderConfigured(envProvider)) return envProvider;
  }

  const configured = getConfiguredProviderIds();
  if (configured[0]) return configured[0];

  return parseProviderId(resolveEnv(process.env.AI_PROVIDER, 'gemini'));
}

export function getAiConfig(): AiConfig {
  const providerId = getProviderId();
  const defaults = PROVIDER_DEFAULTS[providerId];
  return buildAiConfig(providerId, resolveEnv(process.env.AI_MODEL, defaults.model));
}

export function resolveAiConfig(preferences: UserAiPreferences | null | undefined): AiConfig {
  if (!preferences?.providerId) return getAiConfig();

  const providerId = isProviderConfigured(preferences.providerId) ? preferences.providerId : getProviderId();
  const defaults = PROVIDER_DEFAULTS[providerId];
  const savedModel = preferences.model?.trim();
  const model =
    savedModel && (providerId !== 'nvidia-nim' || isNvidiaModelHosted(savedModel)) ? savedModel : defaults.model;
  return buildAiConfig(providerId, model);
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
