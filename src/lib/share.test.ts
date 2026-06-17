import { describe, expect, it } from 'vitest';
import { buildShareUrl, decodeSharedTripPlan, encodeTripPlanForShare, parseShareHash } from './share';
import type { TripPlan } from '../types';

const samplePlan: TripPlan = {
  id: 'trip_test',
  destination: 'Lisboa, Portugal',
  durationDays: 3,
  tagline: 'Azulejos e pastéis',
  summary: 'Roteiro cultural',
  budgetEstimate: {
    totalCostEstimate: 'R$ 3000',
    hotelAverageNight: 'R$ 200',
    foodAverageDay: 'R$ 100',
    transportAverageDay: 'R$ 40',
  },
  packingEssentials: ['Casaco leve'],
  weatherExpected: 'Ameno',
  days: [
    {
      dayNumber: 1,
      theme: 'Centro histórico',
      morning: { title: 'Alfama', description: 'Bairro antigo', cost: 'Grátis', duration: '3h' },
      afternoon: { title: 'Castelo', description: 'Vista panorâmica', cost: 'R$ 30', duration: '2h' },
      evening: { title: 'Fado', description: 'Música tradicional', cost: 'R$ 80', duration: '2h' },
      diningSpot: { name: 'Tasca', type: 'Portuguesa', priceLevel: 'R$ Moderado', description: 'Bacalhau' },
    },
  ],
  tips: [{ category: 'Transporte', text: 'Use o metro' }],
  createdAt: '2026-01-15T10:00:00.000Z',
};

describe('share', () => {
  it('round-trips trip plan through base64 encoding', () => {
    const encoded = encodeTripPlanForShare(samplePlan);
    const decoded = decodeSharedTripPlan(encoded);
    expect(decoded?.destination).toBe(samplePlan.destination);
    expect(decoded?.days).toHaveLength(1);
  });

  it('parses share hash from URL fragment', () => {
    const url = buildShareUrl(samplePlan, 'http://localhost:3000', '/');
    const hash = url.split('#')[1] ?? '';
    const parsed = parseShareHash(`#${hash}`);
    expect(parsed?.id).toBe('trip_test');
  });

  it('returns null for invalid hash', () => {
    expect(parseShareHash('#share=not-valid-base64!!!')).toBeNull();
    expect(parseShareHash('#other=abc')).toBeNull();
  });
});
