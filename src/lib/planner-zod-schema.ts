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

export type PlannerParseContext = {
  destination?: string;
  durationDays?: number;
};

export function extractJsonPayload(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizePlannerPayload(parsed: unknown, context?: PlannerParseContext): unknown {
  if (!isRecord(parsed)) return parsed;

  if (!parsed.destination && isRecord(parsed.trip)) {
    return normalizePlannerPayload(parsed.trip, context);
  }

  if (!parsed.destination && isRecord(parsed.plan)) {
    return normalizePlannerPayload(parsed.plan, context);
  }

  const normalized = { ...parsed };

  if (
    context?.destination &&
    (normalized.destination === undefined || normalized.destination === null || normalized.destination === '')
  ) {
    normalized.destination = context.destination;
  }

  if (context?.durationDays && (normalized.durationDays === undefined || normalized.durationDays === null)) {
    normalized.durationDays = context.durationDays;
  }

  return normalized;
}

export function parsePlannerResult(rawJson: string, context?: PlannerParseContext): PlannerResult {
  let parsed: unknown;

  try {
    parsed = extractJsonPayload(rawJson);
  } catch {
    throw new Error('Planner response is not valid JSON.');
  }

  parsed = normalizePlannerPayload(parsed, context);

  const result = plannerResultSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join('.') || 'response';
    throw new Error(`Invalid planner JSON at ${path}: ${issue?.message ?? 'validation failed'}`);
  }

  return result.data;
}
