import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { isTripPlannerMultiStepEnabled } from '../lib/trip-planner-config';
import type { DayPlan, TravelTip } from '../types';
import { getAuth } from '../lib/auth.server';
import { getDbReady } from '../lib/db/index';
import type { PlannerOutline } from './planner.server';
import { getLlmProviderForUser } from './ai-llm.server';
import {
  generateAndPersistTripPlan,
  generateTripDay,
  generateTripOutline,
  generateTripPlan,
  generateTripTips,
  persistAssembledTripPlan,
  ValidationError,
} from './planner.server';

const tripSearchParamsSchema = z.object({
  destination: z.string(),
  duration: z.number(),
  budget: z.string(),
  style: z.string(),
  companion: z.string(),
  season: z.string(),
  extraNotes: z.string(),
});

const plannerOutlineSchema = z.object({
  destination: z.string(),
  durationDays: z.number(),
  tagline: z.string(),
  summary: z.string(),
  budgetEstimate: z.object({
    totalCostEstimate: z.string(),
    hotelAverageNight: z.string(),
    foodAverageDay: z.string(),
    transportAverageDay: z.string(),
  }),
  packingEssentials: z.array(z.string()),
  weatherExpected: z.string(),
});

const dayPlanSchema = z.object({
  dayNumber: z.number(),
  theme: z.string(),
  morning: z.object({
    title: z.string(),
    description: z.string(),
    cost: z.string(),
    duration: z.string(),
  }),
  afternoon: z.object({
    title: z.string(),
    description: z.string(),
    cost: z.string(),
    duration: z.string(),
  }),
  evening: z.object({
    title: z.string(),
    description: z.string(),
    cost: z.string(),
    duration: z.string(),
  }),
  diningSpot: z.object({
    name: z.string(),
    type: z.string(),
    priceLevel: z.string(),
    description: z.string(),
  }),
});

const travelTipSchema = z.object({
  category: z.string(),
  text: z.string(),
});

async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: getRequest().headers });
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

function mapPlannerError(error: unknown): never {
  if (error instanceof ValidationError) {
    throw new Error(error.message);
  }
  const message = error instanceof Error ? error.message : 'Internal server error';
  throw new Error(message);
}

export const getTripPlannerConfigFn = createServerFn({ method: 'GET' }).handler(async () => ({
  multiStep: isTripPlannerMultiStepEnabled(),
}));

export const generateTripPlanFn = createServerFn({ method: 'POST' })
  .validator(z.object({ params: tripSearchParamsSchema, locale: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      const userId = await requireUserId();
      const provider = await getLlmProviderForUser();
      const db = await getDbReady();
      return await generateAndPersistTripPlan(db, userId, provider, data.params, data.locale ?? 'pt-BR');
    } catch (error) {
      mapPlannerError(error);
    }
  });

export const generateTripOutlineFn = createServerFn({ method: 'POST' })
  .validator(z.object({ params: tripSearchParamsSchema, locale: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      await requireUserId();
      const provider = await getLlmProviderForUser();
      return await generateTripOutline(provider, data.params, data.locale ?? 'pt-BR');
    } catch (error) {
      mapPlannerError(error);
    }
  });

export const generateTripDayFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      params: tripSearchParamsSchema,
      locale: z.string().optional(),
      dayNumber: z.number().int().min(1),
      outline: plannerOutlineSchema,
    }),
  )
  .handler(async ({ data }) => {
    try {
      await requireUserId();
      const provider = await getLlmProviderForUser();
      return await generateTripDay(
        provider,
        data.params,
        data.locale ?? 'pt-BR',
        data.dayNumber,
        data.outline as PlannerOutline,
      );
    } catch (error) {
      mapPlannerError(error);
    }
  });

export const generateTripTipsFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      params: tripSearchParamsSchema,
      locale: z.string().optional(),
      outline: plannerOutlineSchema,
      days: z.array(dayPlanSchema),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await requireUserId();
      const provider = await getLlmProviderForUser();
      return await generateTripTips(
        provider,
        data.params,
        data.locale ?? 'pt-BR',
        data.outline as PlannerOutline,
        data.days as DayPlan[],
      );
    } catch (error) {
      mapPlannerError(error);
    }
  });

export const persistAssembledTripPlanFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      params: tripSearchParamsSchema,
      outline: plannerOutlineSchema,
      days: z.array(dayPlanSchema),
      tips: z.array(travelTipSchema),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const userId = await requireUserId();
      const db = await getDbReady();
      return await persistAssembledTripPlan(
        db,
        userId,
        data.params,
        data.outline as PlannerOutline,
        data.days as DayPlan[],
        data.tips as TravelTip[],
      );
    } catch (error) {
      mapPlannerError(error);
    }
  });
