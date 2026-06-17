import { describe, expect, it } from 'vitest';
import { parseAiGenerationError } from './ai-error';

describe('parseAiGenerationError', () => {
  it('extracts nested nvidia unavailable message', () => {
    const raw =
      'NVIDIA NIM request failed (503): {"error":{"code":503,"message":"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.","status":"UNAVAILABLE"}}';

    expect(parseAiGenerationError(raw)).toEqual({
      message:
        'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      statusCode: 503,
      isRetryable: true,
    });
  });

  it('marks generic errors as non-retryable when no transient signal exists', () => {
    expect(parseAiGenerationError('Destination and duration are required.')).toEqual({
      message: 'Destination and duration are required.',
      statusCode: undefined,
      isRetryable: false,
    });
  });

  it('marks nvidia 404 model errors as retryable', () => {
    expect(parseAiGenerationError('NVIDIA NIM request failed (404): 404 page not found')).toEqual({
      message: 'NVIDIA NIM request failed (404): 404 page not found',
      statusCode: 404,
      isRetryable: true,
    });
  });
});
