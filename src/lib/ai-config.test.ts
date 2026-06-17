import { afterEach, describe, expect, it, vi } from 'vitest';
import { AI_PROVIDER, DEFAULT_AI_MODEL, getAiConfig } from './ai-config';

describe('getAiConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns default provider and model when env vars are empty', () => {
    vi.stubEnv('AI_PROVIDER', '   ');
    vi.stubEnv('AI_MODEL', '');

    expect(getAiConfig()).toEqual({
      provider: AI_PROVIDER,
      model: DEFAULT_AI_MODEL,
    });
  });

  it('returns provider and model from environment variables', () => {
    vi.stubEnv('AI_PROVIDER', 'Custom Provider');
    vi.stubEnv('AI_MODEL', 'custom-model-v1');

    expect(getAiConfig()).toEqual({
      provider: 'Custom Provider',
      model: 'custom-model-v1',
    });
  });
});
