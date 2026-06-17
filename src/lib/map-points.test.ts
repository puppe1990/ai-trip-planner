import { describe, expect, it } from 'vitest';
import { buildMapPoints, buildRoutesPath, getDeterministicHash, sortPointsChronologically } from './map-points';
import type { TripPlan } from '../types';

const plan: TripPlan = {
  id: 'map_test',
  destination: 'Kyoto, Japão',
  durationDays: 2,
  tagline: 'Templos',
  summary: 'Cultura',
  budgetEstimate: {
    totalCostEstimate: 'R$ 4000',
    hotelAverageNight: 'R$ 200',
    foodAverageDay: 'R$ 100',
    transportAverageDay: 'R$ 30',
  },
  packingEssentials: [],
  weatherExpected: 'Ameno',
  days: [
    {
      dayNumber: 1,
      theme: 'Templos',
      morning: { title: 'Fushimi Inari', description: 'Torii gates', cost: 'Grátis', duration: '3h' },
      afternoon: { title: 'Arashiyama', description: 'Bamboo grove', cost: 'R$ 20', duration: '4h' },
      evening: { title: 'Gion', description: 'Geisha district', cost: 'Grátis', duration: '2h' },
      diningSpot: { name: 'Ramen Ya', type: 'Japonesa', priceLevel: 'R$ Barato', description: 'Tonkotsu' },
    },
    {
      dayNumber: 2,
      theme: 'Cidade',
      morning: { title: 'Nijo Castle', description: 'Castelo', cost: 'R$ 40', duration: '2h' },
      afternoon: { title: 'Nishiki Market', description: 'Mercado', cost: 'R$ 30', duration: '3h' },
      evening: { title: 'Pontocho', description: 'Ruelas', cost: 'R$ 60', duration: '2h' },
      diningSpot: { name: 'Izakaya', type: 'Japonesa', priceLevel: 'R$ Moderado', description: 'Sake' },
    },
  ],
  tips: [],
  createdAt: '2026-03-01T00:00:00.000Z',
};

describe('map-points', () => {
  it('generates deterministic hash for same input', () => {
    expect(getDeterministicHash('test')).toBe(getDeterministicHash('test'));
    expect(getDeterministicHash('a')).not.toBe(getDeterministicHash('b'));
  });

  it('builds projected map points for all days and slots', () => {
    const points = buildMapPoints(plan);
    expect(points).toHaveLength(8);
    expect(points.every((p) => p.x > 0 && p.y > 0)).toBe(true);
  });

  it('sorts points chronologically and builds route path', () => {
    const points = buildMapPoints(plan);
    const day1 = points.filter((p) => p.dayNumber === 1);
    const sorted = sortPointsChronologically(day1);
    expect(sorted[0].timeSlot).toBe('Manhã');
    expect(sorted[sorted.length - 1].timeSlot).toBe('Noite');
    const path = buildRoutesPath(day1);
    expect(path).toMatch(/^M /);
    expect(path).toContain('C ');
  });
});
