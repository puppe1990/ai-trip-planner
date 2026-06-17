import { afterEach, describe, expect, it, vi } from 'vitest';
import { getModelsForProvider, InvalidAiProviderError, PROVIDER_MODELS } from './ai-config';
import { getAiConfig, getProviderId, listProviderOptions, resolveAiConfig } from './ai-config.server';

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
    vi.stubEnv('NVIDIA_API_KEY', 'key');
    expect(getProviderId()).toBe('nvidia-nim');
  });

  it('falls back to nvidia-nim when gemini env is set but not configured', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'key');
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
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'key');

    expect(getAiConfig()).toEqual({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'nvidia/nvidia-nemotron-nano-9b-v2',
      capabilities: { structuredJson: true, webGrounding: false },
    });
  });

  it('allows AI_MODEL override for any provider', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'key');
    vi.stubEnv('AI_MODEL', 'nvidia/nemotron-3-nano-30b-a3b');

    expect(getAiConfig().model).toBe('nvidia/nemotron-3-nano-30b-a3b');
  });
});

describe('resolveAiConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back when saved provider is not configured', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'key');

    expect(resolveAiConfig({ providerId: 'gemini', model: null }).providerId).toBe('nvidia-nim');
  });

  it('uses user provider preference over env default', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', 'key');
    vi.stubEnv('NVIDIA_API_KEY', 'key');

    expect(resolveAiConfig({ providerId: 'nvidia-nim', model: null })).toEqual({
      providerId: 'nvidia-nim',
      provider: 'NVIDIA NIM',
      model: 'nvidia/nvidia-nemotron-nano-9b-v2',
      capabilities: { structuredJson: true, webGrounding: false },
    });
  });

  it('uses user model preference when provider is set', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', 'key');
    vi.stubEnv('NVIDIA_API_KEY', 'key');

    expect(resolveAiConfig({ providerId: 'nvidia-nim', model: 'meta/llama-3.1-8b-instruct' }).model).toBe(
      'meta/llama-3.1-8b-instruct',
    );
  });

  it('falls back to env when user has no preferences', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'key');
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
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exposes only hosted nvidia nim model options', () => {
    expect(PROVIDER_MODELS['nvidia-nim'].length).toBe(6);
    expect(PROVIDER_MODELS['nvidia-nim'].some((model) => model.id === 'qwen/qwen2.5-72b-instruct')).toBe(false);
    expect(PROVIDER_MODELS['nvidia-nim'][0]?.id).toBe('nvidia/nvidia-nemotron-nano-9b-v2');
  });

  it('falls back to hosted default when saved nvidia model is unavailable', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', 'key');
    vi.stubEnv('NVIDIA_API_KEY', 'key');

    expect(
      resolveAiConfig({
        providerId: 'nvidia-nim',
        model: 'qwen/qwen2.5-72b-instruct',
      }).model,
    ).toBe('nvidia/nvidia-nemotron-nano-9b-v2');
  });

  it('does not surface unavailable nvidia models in the picker', () => {
    const models = getModelsForProvider('nvidia-nim', 'qwen/qwen2.5-72b-instruct');

    expect(models.some((model) => model.id === 'qwen/qwen2.5-72b-instruct')).toBe(false);
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
    expect(options.find((o) => o.id === 'nvidia-nim')?.models.length).toBe(6);
  });
});
