import type { TripPlan, TripSearchParams } from '../types';
import type { TripGenerationProgress } from './trip-generation';
import { runTripGeneration } from './trip-generation';
import {
  generateTripDayFn,
  generateTripOutlineFn,
  generateTripPlanFn,
  generateTripTipsFn,
  getTripPlannerConfigFn,
  persistAssembledTripPlanFn,
} from '../server/planner.functions';

export async function generateTripPlanForUser(
  params: TripSearchParams,
  locale: string,
  onProgress?: (progress: TripGenerationProgress) => void,
): Promise<TripPlan> {
  const { multiStep } = await getTripPlannerConfigFn();

  return runTripGeneration({
    params,
    locale,
    isMultiStepEnabled: () => multiStep,
    onProgress,
    generateSingleShot: async (nextParams, nextLocale) =>
      (await generateTripPlanFn({ data: { params: nextParams, locale: nextLocale } })) as TripPlan,
    generateOutline: async (nextParams, nextLocale) =>
      (await generateTripOutlineFn({ data: { params: nextParams, locale: nextLocale } })) as Awaited<
        ReturnType<typeof generateTripOutlineFn>
      >,
    generateDay: async (nextParams, nextLocale, dayNumber, outline) =>
      (await generateTripDayFn({
        data: { params: nextParams, locale: nextLocale, dayNumber, outline },
      })) as Awaited<ReturnType<typeof generateTripDayFn>>,
    generateTips: async (nextParams, nextLocale, outline, days) =>
      (await generateTripTipsFn({
        data: { params: nextParams, locale: nextLocale, outline, days },
      })) as Awaited<ReturnType<typeof generateTripTipsFn>>,
    persistAssembled: async (nextParams, outline, days, tips) =>
      (await persistAssembledTripPlanFn({
        data: { params: nextParams, outline, days, tips },
      })) as TripPlan,
  });
}
