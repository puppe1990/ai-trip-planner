import { describe, expect, it } from 'vitest';
import { extractJsonPayload, normalizePlannerPayload, parsePlannerResult } from './planner-zod-schema';

const validPlannerResult = {
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
      morning: { title: 'A', description: 'B', cost: 'C', duration: 'D' },
      afternoon: { title: 'A', description: 'B', cost: 'C', duration: 'D' },
      evening: { title: 'A', description: 'B', cost: 'C', duration: 'D' },
      diningSpot: { name: 'N', type: 'T', priceLevel: '$$', description: 'D' },
    },
  ],
  tips: [{ category: 'Transport', text: 'Get a metro pass' }],
};

describe('parsePlannerResult', () => {
  it('accepts a valid planner JSON payload', () => {
    const result = parsePlannerResult(JSON.stringify(validPlannerResult));
    expect(result.destination).toBe('Tokyo, Japan');
    expect(result.days).toHaveLength(1);
  });

  it('fills missing destination and duration from context', () => {
    const incomplete = { ...validPlannerResult, destination: undefined, durationDays: undefined };
    const result = parsePlannerResult(JSON.stringify(incomplete), {
      destination: 'Paris, France',
      durationDays: 4,
    });

    expect(result.destination).toBe('Paris, France');
    expect(result.durationDays).toBe(4);
  });

  it('parses JSON wrapped in markdown fences', () => {
    const fenced = `\`\`\`json\n${JSON.stringify(validPlannerResult)}\n\`\`\``;
    expect(extractJsonPayload(fenced)).toEqual(validPlannerResult);
  });

  it('unwraps nested trip payloads', () => {
    const wrapped = normalizePlannerPayload(
      { trip: { ...validPlannerResult, destination: undefined, durationDays: undefined } },
      { destination: 'Lisbon, Portugal', durationDays: 3 },
    );

    expect((wrapped as { destination: string }).destination).toBe('Lisbon, Portugal');
  });

  it('rejects incomplete planner JSON with a descriptive error', () => {
    const incomplete = { destination: 'Paris' };
    expect(() => parsePlannerResult(JSON.stringify(incomplete))).toThrow(/Invalid planner JSON/i);
  });
});
