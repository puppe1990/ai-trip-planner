import { describe, expect, it } from 'vitest';
import { parsePlannerResult } from './planner-zod-schema';

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

  it('rejects incomplete planner JSON with a descriptive error', () => {
    const incomplete = { ...validPlannerResult, destination: undefined };
    expect(() => parsePlannerResult(JSON.stringify(incomplete))).toThrow(/destination/i);
  });
});
