import { describe, expect, it } from 'vitest';
import { PROVIDER_MODELS } from '../ai-config';
import {
  assertNvidiaModelHosted,
  filterHostedNvidiaModels,
  isNvidiaModelHosted,
  NvidiaModelNotHostedError,
} from './nvidia-nim-catalog';

describe('nvidia-nim-catalog', () => {
  it('marks known hosted models as available', () => {
    expect(isNvidiaModelHosted('meta/llama-3.3-70b-instruct')).toBe(true);
    expect(isNvidiaModelHosted('qwen/qwen2.5-72b-instruct')).toBe(false);
  });

  it('filters catalog to hosted models only', () => {
    const filtered = filterHostedNvidiaModels([
      { id: 'qwen/qwen2.5-72b-instruct', label: 'Qwen 2.5 72B Instruct' },
      { id: 'meta/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
    ]);

    expect(filtered).toEqual([{ id: 'meta/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' }]);
  });

  it('exposes only hosted models in provider catalog', () => {
    expect(PROVIDER_MODELS['nvidia-nim'].some((model) => model.id === 'qwen/qwen2.5-72b-instruct')).toBe(false);
    expect(PROVIDER_MODELS['nvidia-nim'][0]?.id).toBe('meta/llama-3.3-70b-instruct');
  });

  it('throws when saving an unhosted model', () => {
    expect(() => assertNvidiaModelHosted('qwen/qwen2.5-72b-instruct')).toThrow(NvidiaModelNotHostedError);
  });
});
