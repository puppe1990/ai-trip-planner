import type { DayPlan, TravelTip, TripPlan, TripSearchParams } from '../types';
import type { PlannerOutline } from '../server/planner.server';

export type TripGenerationPhase = 'outline' | 'day' | 'tips' | 'saving';

export type TripGenerationProgress = {
  phase: TripGenerationPhase;
  dayNumber?: number;
  totalDays?: number;
};

export type TripGenerationDeps = {
  params: TripSearchParams;
  locale: string;
  isMultiStepEnabled: () => boolean;
  generateSingleShot: (params: TripSearchParams, locale: string) => Promise<TripPlan>;
  generateOutline: (params: TripSearchParams, locale: string) => Promise<PlannerOutline>;
  generateDay: (
    params: TripSearchParams,
    locale: string,
    dayNumber: number,
    outline: PlannerOutline,
  ) => Promise<DayPlan>;
  generateTips: (
    params: TripSearchParams,
    locale: string,
    outline: PlannerOutline,
    days: DayPlan[],
  ) => Promise<TravelTip[]>;
  persistAssembled: (
    params: TripSearchParams,
    outline: PlannerOutline,
    days: DayPlan[],
    tips: TravelTip[],
  ) => Promise<TripPlan>;
  onProgress?: (progress: TripGenerationProgress) => void;
};

export async function runTripGeneration(deps: TripGenerationDeps): Promise<TripPlan> {
  const { params, locale, onProgress } = deps;

  if (!deps.isMultiStepEnabled()) {
    return deps.generateSingleShot(params, locale);
  }

  const outline = await deps.generateOutline(params, locale);
  onProgress?.({ phase: 'outline' });

  const days: DayPlan[] = [];
  for (let dayNumber = 1; dayNumber <= params.duration; dayNumber++) {
    days.push(await deps.generateDay(params, locale, dayNumber, outline));
    onProgress?.({ phase: 'day', dayNumber, totalDays: params.duration });
  }

  const tips = await deps.generateTips(params, locale, outline, days);
  onProgress?.({ phase: 'tips' });

  onProgress?.({ phase: 'saving' });
  return deps.persistAssembled(params, outline, days, tips);
}
