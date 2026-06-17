import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLlmProvider, resetLlmProviderForTests } from './factory';

describe('getLlmProvider', () => {
  beforeEach(() => {
    resetLlmProviderForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetLlmProviderForTests();
  });

  it('returns gemini provider by default', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key');

    const provider = getLlmProvider();

    expect(provider.id).toBe('gemini');
    expect(provider.displayName).toBe('Google Gemini');
  });

  it('returns nvidia-nim provider when configured', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');
    vi.stubEnv('NVIDIA_API_KEY', 'test-nvidia-key');

    const provider = getLlmProvider();

    expect(provider.id).toBe('nvidia-nim');
    expect(provider.displayName).toBe('NVIDIA NIM');
  });

  it('throws when gemini api key is missing', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', '');

    expect(() => getLlmProvider()).toThrow('GEMINI_API_KEY');
  });

  it('throws when nvidia api key is missing', () => {
    vi.stubEnv('AI_PROVIDER', 'nvidia-nim');
    vi.stubEnv('NVIDIA_API_KEY', '');

    expect(() => getLlmProvider()).toThrow('NVIDIA_API_KEY');
  });
});
