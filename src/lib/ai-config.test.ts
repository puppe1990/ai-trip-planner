import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAiConfig, getProviderId, InvalidAiProviderError } from './ai-config';

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
