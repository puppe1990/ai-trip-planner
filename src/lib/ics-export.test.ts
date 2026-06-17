import { describe, expect, it } from 'vitest';
import { generateIcsContent } from './ics-export';
import type { TripPlan } from '../types';

const plan: TripPlan = {
  id: 'trip_ics',
  destination: 'Barcelona, Espanha',
  durationDays: 1,
  tagline: 'Gaudí',
  summary: 'Arte e praia',
  budgetEstimate: {
    totalCostEstimate: 'R$ 2000',
    hotelAverageNight: 'R$ 250',
    foodAverageDay: 'R$ 120',
    transportAverageDay: 'R$ 40',
  },
  packingEssentials: [],
  weatherExpected: 'Quente',
  days: [
    {
      dayNumber: 1,
      theme: 'Gaudí',
      morning: { title: 'Sagrada Família', description: 'Basílica icônica', cost: 'R$ 100', duration: '3h' },
      afternoon: { title: 'Park Güell', description: 'Parque colorido', cost: 'R$ 50', duration: '2h' },
      evening: { title: 'Las Ramblas', description: 'Passeio noturno', cost: 'Grátis', duration: '2h' },
      diningSpot: { name: 'Tapas Bar', type: 'Espanhola', priceLevel: 'R$ Moderado', description: 'Paella' },
    },
  ],
  tips: [],
  createdAt: '2026-02-01T12:00:00.000Z',
};

describe('generateIcsContent', () => {
  it('generates valid VCALENDAR with VEVENT entries', () => {
    const ics = generateIcsContent(plan, '2026-06-15');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics?.match(/BEGIN:VEVENT/g)?.length).toBe(4);
  });

  it('escapes semicolons in text fields', () => {
    const planWithSpecial = {
      ...plan,
      days: [{
        ...plan.days[0],
        morning: { ...plan.days[0].morning, description: 'Visita; com guia' },
      }],
    };
    const ics = generateIcsContent(planWithSpecial, '2026-06-15');
    expect(ics).toContain('Visita\\; com guia');
  });

  it('returns null for invalid start date', () => {
    expect(generateIcsContent(plan, 'invalid-date')).toBeNull();
  });
});