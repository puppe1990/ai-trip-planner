import { z } from 'zod';
import type { PlannerResult } from '../server/planner.server';

const activitySchema = z.object({
  title: z.string(),
  description: z.string(),
  cost: z.string(),
  duration: z.string(),
});

const diningSpotSchema = z.object({
  name: z.string(),
  type: z.string(),
  priceLevel: z.string(),
  description: z.string(),
});

const dayPlanSchema = z.object({
  dayNumber: z.number().int(),
  theme: z.string(),
  morning: activitySchema,
  afternoon: activitySchema,
  evening: activitySchema,
  diningSpot: diningSpotSchema,
});

export const plannerResultSchema = z.object({
  destination: z.string(),
  durationDays: z.number().int(),
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
  days: z.array(dayPlanSchema),
  tips: z.array(
    z.object({
      category: z.string(),
      text: z.string(),
    }),
  ),
});

export function parsePlannerResult(rawJson: string): PlannerResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson.trim());
  } catch {
    throw new Error('Planner response is not valid JSON.');
  }

  const result = plannerResultSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join('.') || 'response';
    throw new Error(`Invalid planner JSON at ${path}: ${issue?.message ?? 'validation failed'}`);
  }

  return result.data;
}
