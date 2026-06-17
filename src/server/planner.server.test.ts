import { describe, expect, it, vi } from 'vitest';
import type { LlmProvider } from '../lib/llm/types';
import { buildPlannerPrompt, generateTripPlan, validateSearchParams, ValidationError } from './planner.server';
import type { TripSearchParams } from '../types';

const validParams: TripSearchParams = {
  destination: 'Tokyo, Japan',
  duration: 5,
  budget: 'Médio',
  style: 'Cultural',
  companion: 'Solo',
  season: 'Spring',
  extraNotes: 'Temples',
};

const activity = { title: 'A', description: 'B', cost: 'C', duration: 'D' };

const validPlannerJson = {
  destination: 'Tokyo, Japan',
  durationDays: 5,
  tagline: 'Future meets tradition',
  summary: 'Amazing trip',
  budgetEstimate: {
    totalCostEstimate: '$2000',
    hotelAverageNight: '$100',
    foodAverageDay: '$50',
    transportAverageDay: '$20',
  },
  packingEssentials: ['Comfortable shoes'],
  weatherExpected: 'Mild spring',
  days: [
    {
      dayNumber: 1,
      theme: 'Arrival',
      morning: activity,
      afternoon: activity,
      evening: activity,
      diningSpot: { name: 'N', type: 'T', priceLevel: '$$', description: 'D' },
    },
  ],
  tips: [{ category: 'Transport', text: 'Get a metro pass' }],
};

function createMockProvider(generateJson = vi.fn()): LlmProvider {
  return {
    id: 'gemini',
    displayName: 'Google Gemini',
    model: 'gemini-3.5-flash',
    capabilities: { structuredJson: true, webGrounding: true },
    generateJson,
    generateText: vi.fn(),
    generateGroundedText: vi.fn(),
  };
}

describe('planner.server', () => {
  it('validates required fields', () => {
    expect(() => validateSearchParams({ ...validParams, destination: '' })).toThrow(ValidationError);
    expect(() => validateSearchParams({ ...validParams, duration: 0 })).toThrow(ValidationError);
  });

  it('builds English prompt when locale is en', () => {
    const prompt = buildPlannerPrompt(validParams, 'en');
    expect(prompt).toContain('English');
    expect(prompt).toContain('Tokyo, Japan');
  });

  it('builds Portuguese prompt by default', () => {
    const prompt = buildPlannerPrompt(validParams, 'pt-BR');
    expect(prompt).toContain('Português do Brasil');
  });

  it('generates trip plan via provider.generateJson', async () => {
    const generateJson = vi.fn().mockResolvedValue(JSON.stringify(validPlannerJson));
    const provider = createMockProvider(generateJson);

    const result = await generateTripPlan(provider, validParams, 'en');

    expect(result.destination).toBe('Tokyo, Japan');
    expect(generateJson).toHaveBeenCalledOnce();
    expect(generateJson).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('Tokyo, Japan'),
        system: expect.stringContaining('English'),
        temperature: 0.8,
      }),
    );
  });

  it('retries when planner JSON validation fails', async () => {
    const generateJson = vi
      .fn()
      .mockResolvedValueOnce(JSON.stringify({ tagline: 'missing required fields' }))
      .mockResolvedValue(JSON.stringify(validPlannerJson));

    const provider = createMockProvider(generateJson);
    const result = await generateTripPlan(provider, validParams, 'en');

    expect(result.destination).toBe('Tokyo, Japan');
    expect(generateJson).toHaveBeenCalledTimes(2);
    expect(generateJson.mock.calls[0]?.[0]?.system).toContain('destination');
  });

  it('retries provider.generateJson up to three times', async () => {
    const generateJson = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary'))
      .mockRejectedValueOnce(new Error('temporary'))
      .mockResolvedValue(JSON.stringify(validPlannerJson));

    const provider = createMockProvider(generateJson);

    const result = await generateTripPlan(provider, validParams, 'en');
    expect(result.destination).toBe('Tokyo, Japan');
    expect(generateJson).toHaveBeenCalledTimes(3);
  });
});
