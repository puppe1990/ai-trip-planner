import { describe, expect, it, vi } from 'vitest';
import type { DayPlan, TripPlan, TripSearchParams } from '../types';
import type { PlannerOutline } from '../server/planner.server';
import { runTripGeneration } from './trip-generation';

const params: TripSearchParams = {
  destination: 'Lisbon, Portugal',
  duration: 2,
  budget: 'Médio',
  style: 'Cultural',
  companion: 'Solo',
  season: 'Spring',
  extraNotes: '',
};

const outline: PlannerOutline = {
  destination: 'Lisbon, Portugal',
  durationDays: 2,
  tagline: 'Tiles and tramways',
  summary: 'A cultural weekend',
  budgetEstimate: {
    totalCostEstimate: '$800',
    hotelAverageNight: '$100',
    foodAverageDay: '$40',
    transportAverageDay: '$15',
  },
  packingEssentials: ['Comfortable shoes'],
  weatherExpected: 'Mild spring',
};

const dayPlan = (dayNumber: number): DayPlan => ({
  dayNumber,
  theme: `Day ${dayNumber}`,
  morning: { title: 'M', description: 'MD', cost: '$', duration: '2h' },
  afternoon: { title: 'A', description: 'AD', cost: '$', duration: '3h' },
  evening: { title: 'E', description: 'ED', cost: '$', duration: '2h' },
  diningSpot: { name: 'Tasca', type: 'Local', priceLevel: '$$', description: 'Cozy' },
});

const assembledPlan: TripPlan = {
  id: 'trip_test',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...outline,
  days: [dayPlan(1), dayPlan(2)],
  tips: [{ category: 'Transport', text: 'Get a Viva Viagem card' }],
  budgetPreference: params.budget,
  stylePreference: params.style,
  companionPreference: params.companion,
};

describe('runTripGeneration', () => {
  it('uses single-shot generation when multi-step is disabled', async () => {
    const generateSingleShot = vi.fn().mockResolvedValue(assembledPlan);
    const generateOutline = vi.fn();
    const generateDay = vi.fn();
    const generateTips = vi.fn();
    const persistAssembled = vi.fn();

    const result = await runTripGeneration({
      params,
      locale: 'en',
      isMultiStepEnabled: () => false,
      generateSingleShot,
      generateOutline,
      generateDay,
      generateTips,
      persistAssembled,
    });

    expect(result).toEqual(assembledPlan);
    expect(generateSingleShot).toHaveBeenCalledOnce();
    expect(generateOutline).not.toHaveBeenCalled();
    expect(generateDay).not.toHaveBeenCalled();
    expect(generateTips).not.toHaveBeenCalled();
    expect(persistAssembled).not.toHaveBeenCalled();
  });

  it('runs outline, each day, tips and persist when multi-step is enabled', async () => {
    const onProgress = vi.fn();
    const generateSingleShot = vi.fn();
    const generateOutline = vi.fn().mockResolvedValue(outline);
    const generateDay = vi.fn().mockResolvedValueOnce(dayPlan(1)).mockResolvedValueOnce(dayPlan(2));
    const generateTips = vi.fn().mockResolvedValue([{ category: 'Transport', text: 'Get a Viva Viagem card' }]);
    const persistAssembled = vi.fn().mockResolvedValue(assembledPlan);

    const result = await runTripGeneration({
      params,
      locale: 'pt-BR',
      isMultiStepEnabled: () => true,
      generateSingleShot,
      generateOutline,
      generateDay,
      generateTips,
      persistAssembled,
      onProgress,
    });

    expect(result).toEqual(assembledPlan);
    expect(generateSingleShot).not.toHaveBeenCalled();
    expect(generateOutline).toHaveBeenCalledWith(params, 'pt-BR');
    expect(generateDay).toHaveBeenCalledTimes(2);
    expect(generateDay).toHaveBeenNthCalledWith(1, params, 'pt-BR', 1, outline);
    expect(generateDay).toHaveBeenNthCalledWith(2, params, 'pt-BR', 2, outline);
    expect(generateTips).toHaveBeenCalledWith(params, 'pt-BR', outline, [dayPlan(1), dayPlan(2)]);
    expect(persistAssembled).toHaveBeenCalledWith(
      params,
      outline,
      [dayPlan(1), dayPlan(2)],
      [{ category: 'Transport', text: 'Get a Viva Viagem card' }],
    );
    expect(onProgress).toHaveBeenCalledWith({ phase: 'outline' });
    expect(onProgress).toHaveBeenCalledWith({ phase: 'day', dayNumber: 1, totalDays: 2 });
    expect(onProgress).toHaveBeenCalledWith({ phase: 'day', dayNumber: 2, totalDays: 2 });
    expect(onProgress).toHaveBeenCalledWith({ phase: 'tips' });
    expect(onProgress).toHaveBeenCalledWith({ phase: 'saving' });
  });
});
