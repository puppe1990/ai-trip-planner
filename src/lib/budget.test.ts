import { describe, expect, it } from 'vitest';
import { calculateGroupBudget, parseCost } from './budget';
import type { TripPlan } from '../types';

const basePlan: TripPlan = {
  id: 'trip_1',
  destination: 'Paris',
  durationDays: 4,
  tagline: 'test',
  summary: 'test',
  budgetEstimate: {
    totalCostEstimate: 'R$ 5000',
    hotelAverageNight: 'R$ 300',
    foodAverageDay: 'R$ 150',
    transportAverageDay: 'R$ 50',
  },
  packingEssentials: [],
  weatherExpected: '',
  days: [],
  tips: [],
  createdAt: new Date().toISOString(),
};

describe('parseCost', () => {
  it('extracts numeric value from Brazilian currency string', () => {
    expect(parseCost('R$ 1.500')).toBe(1500);
  });

  it('returns 0 for empty string', () => {
    expect(parseCost('')).toBe(0);
  });

  it('extracts first number from free text', () => {
    expect(parseCost('Grátis ou R$ 80')).toBe(80);
  });
});

describe('calculateGroupBudget', () => {
  it('calculates group totals for multiple travelers', () => {
    const result = calculateGroupBudget(basePlan, 3);
    expect(result.doubleRooms).toBe(2);
    expect(result.hotelGroup).toBe(300 * 2 * 4);
    expect(result.foodGroup).toBe(150 * 3 * 4);
    expect(result.transportGroup).toBe(50 * 3 * 4);
    expect(result.total).toBe(result.hotelGroup + result.foodGroup + result.transportGroup);
  });

  it('uses one double room for solo traveler', () => {
    const result = calculateGroupBudget(basePlan, 1);
    expect(result.doubleRooms).toBe(1);
    expect(result.hotelGroup).toBe(300 * 1 * 4);
  });
});
