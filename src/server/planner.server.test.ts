import { describe, expect, it, vi } from 'vitest';
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

  it('generates trip plan from mocked Gemini client', async () => {
    const mockResult = {
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
      days: [{ dayNumber: 1 }],
      tips: [{ category: 'Transport', text: 'Get a metro pass' }],
    };

    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: JSON.stringify(mockResult) }),
      },
    };

    const result = await generateTripPlan(mockClient as never, validParams, 'en');
    expect(result.destination).toBe('Tokyo, Japan');
    expect(mockClient.models.generateContent).toHaveBeenCalledOnce();
  });
});