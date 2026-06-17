import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAiConfig,
  getModelsForProvider,
  getProviderId,
  InvalidAiProviderError,
  listProviderOptions,
  PROVIDER_MODELS,
  resolveAiConfig,
} from './ai-config';

describe('getProviderId', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to gemini when AI_PROVIDER is unset', () => {
    vi.stubEnv('AI_PROVIDER', '');
    expect(getProviderId()).toBe('gemini');
  });

  it('returns nvidia-nim when configured', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');
    expect(getProviderId()).toBe('nvidia-nim');
  });

  it('throws for invalid provider id', () => {
    vi.stubEnv('AI_PROVIDER', 'openai');
    expect(() => getProviderId()).toThrow(InvalidAiProviderError);
  });
});

describe('getAiConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns gemini defaults when AI_PROVIDER is gemini', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');

    expect(getAiConfig()).toEqual({
      providerId: 'gemini',
      provider: 'Google Gemini',
      model: 'gemini-3.5-flash',
      capabilities: { structuredJson: true, webGrounding: true },
    });
  });

  it('returns nvidia-nim defaults when AI_PROVIDER is nvidia-nim', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');

    expect(getAiConfig()).toEqual({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'meta/llama-3.3-70b-instruct',
      capabilities: { structuredJson: true, webGrounding: false },
    });
  });

  it('allows AI_MODEL override for any provider', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');
    vi.stubEnv('AI_MODEL', 'nvidia/nemotron-3-nano-30b-a3b');

    expect(getAiConfig().model).toBe('nvidia/nemotron-3-nano-30b-a3b');
  });
});

describe('resolveAiConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses user provider preference over env default', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');

    expect(resolveAiConfig({ providerId: 'nvidia-nim', model: null })).toEqual({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'meta/llama-3.3-70b-instruct',
      capabilities: { structuredJson: true, webGrounding: false },
    });
  });

  it('uses user model preference when provider is set', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');

    expect(resolveAiConfig({ providerId: 'nvidia-nim', model: 'custom-model' }).model).toBe('custom-model');
  });

  it('falls back to env when user has no preferences', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');
    vi.stubEnv('AI_MODEL', 'env-model');

    expect(resolveAiConfig(null)).toEqual({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'env-model',
      capabilities: { structuredJson: true, webGrounding: false },
    });
  });
});

describe('PROVIDER_MODELS', () => {
  it('exposes multiple nvidia nim model options', () => {
    expect(PROVIDER_MODELS['nvidia-nim'].length).toBeGreaterThanOrEqual(10);
    expect(PROVIDER_MODELS['nvidia-nim'].some((model) => model.id === 'mistralai/mistral-large')).toBe(true);
  });

  it('includes custom saved model when not in catalog', () => {
    const models = getModelsForProvider('nvidia-nim', 'custom/legacy-model');

    expect(models[0]).toEqual({ id: 'custom/legacy-model', label: 'custom/legacy-model' });
  });
});

describe('listProviderOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('marks providers as configured when api keys exist', () => {
    vi.stubEnv('GEMINI_API_KEY', 'key');
    vi.stubEnv('NVIDIA_API_KEY', '');

    const options = listProviderOptions();

    expect(options).toHaveLength(2);
    expect(options.find((o) => o.id === 'gemini')?.configured).toBe(true);
    expect(options.find((o) => o.id === 'nvidia-nim')?.configured).toBe(false);
  });

  it('includes model catalogs per provider', () => {
    const options = listProviderOptions();

    expect(options.find((o) => o.id === 'gemini')?.models.length).toBeGreaterThan(1);
    expect(options.find((o) => o.id === 'nvidia-nim')?.models.length).toBeGreaterThanOrEqual(10);
  });
});
