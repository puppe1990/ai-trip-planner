import {
  buildPlannerDaySchemaInstruction,
  buildPlannerJsonSchemaInstruction,
  buildPlannerOutlineSchemaInstruction,
  buildPlannerTipsSchemaInstruction,
} from '../lib/planner-json-instructions';
import { parsePlannerDay, parsePlannerOutline, parsePlannerResult, parsePlannerTips } from '../lib/planner-zod-schema';
import { getGeminiLanguage } from '../i18n/index';
import type { LlmProvider } from '../lib/llm/types';
import type { AppDatabase } from '../lib/db/index';
import { upsertTrip } from './trips.server';
import type { DayPlan, TripPlan, TripSearchParams } from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateSearchParams(params: TripSearchParams): void {
  if (!params.destination?.trim() || !params.duration) {
    throw new ValidationError('Destination and duration are required.');
  }
}

export function buildPlannerPrompt(params: TripSearchParams, locale = 'pt-BR'): string {
  const lang = getGeminiLanguage(locale);
  const languageInstruction =
    lang === 'en'
      ? 'Write ALL content strictly in English.'
      : 'Escreva TODO o conteúdo estritamente em Português do Brasil (pt-BR).';

  return `Create a complete, personalized and detailed trip plan for the destination: "${params.destination}".
Context for personalization:
- Trip duration: ${params.duration} days
- Budget level: ${params.budget || 'Médio'}
- Travel style: ${params.style || 'Equilibrado'}
- Companions: ${params.companion || 'Solo'}
- Season/climate: ${params.season || 'Any season'}
- Additional notes: ${params.extraNotes || 'None'}

${languageInstruction} Organize activities realistically with morning, afternoon and evening plans coherent with travel distances and times.`;
}

export interface PlannerOutline {
  destination: string;
  durationDays: number;
  tagline: string;
  summary: string;
  budgetEstimate: {
    totalCostEstimate: string;
    hotelAverageNight: string;
    foodAverageDay: string;
    transportAverageDay: string;
  };
  packingEssentials: string[];
  weatherExpected: string;
}

export interface PlannerResult extends PlannerOutline {
  days: DayPlan[];
  tips: Array<{ category: string; text: string }>;
}

function getPlannerSystemInstruction(locale: string): string {
  const lang = getGeminiLanguage(locale);
  return lang === 'en'
    ? 'You are a professional travel guide. Create logical, detailed itineraries with authentic local experiences. Respond strictly in the provided JSON schema and in English.'
    : 'Você é um guia turístico profissional. Crie itinerários lógicos e detalhados com experiências locais autênticas. Responda estritamente no schema JSON fornecido e em Português (pt-BR).';
}

async function withGenerationRetries<T>(operation: () => Promise<T>): Promise<T> {
  let delay = 1500;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error('Generation failed.');
}

async function requestPlannerJson(
  provider: LlmProvider,
  locale: string,
  schemaInstruction: string,
  prompt: string,
): Promise<string> {
  const responseText = await provider.generateJson({
    system: `${getPlannerSystemInstruction(locale)}\n\n${schemaInstruction}`,
    prompt: `${prompt}\n\n${schemaInstruction}`,
    temperature: 0.8,
  });

  if (!responseText) throw new Error('No content returned by model.');
  return responseText;
}

export function assemblePlannerResult(
  outline: PlannerOutline,
  days: DayPlan[],
  tips: Array<{ category: string; text: string }>,
): PlannerResult {
  return {
    ...outline,
    days,
    tips,
  };
}

export async function generateTripOutline(
  provider: LlmProvider,
  params: TripSearchParams,
  locale = 'pt-BR',
): Promise<PlannerOutline> {
  validateSearchParams(params);
  const schemaInstruction = buildPlannerOutlineSchemaInstruction();
  const prompt = `${buildPlannerPrompt(params, locale)}\n\nCreate only the trip overview: tagline, summary, budgetEstimate, packingEssentials and weatherExpected.`;

  return withGenerationRetries(async () => {
    const responseText = await requestPlannerJson(provider, locale, schemaInstruction, prompt);
    return parsePlannerOutline(responseText, {
      destination: params.destination.trim(),
      durationDays: params.duration,
    });
  });
}

export async function generateTripDay(
  provider: LlmProvider,
  params: TripSearchParams,
  locale: string,
  dayNumber: number,
  outline: PlannerOutline,
): Promise<DayPlan> {
  const schemaInstruction = buildPlannerDaySchemaInstruction();
  const prompt = `${buildPlannerPrompt(params, locale)}

Trip overview:
- Tagline: ${outline.tagline}
- Summary: ${outline.summary}

Create ONLY day ${dayNumber} of ${params.duration}. Keep activities realistic for the destination and coherent with the overview.`;
  return withGenerationRetries(async () => {
    const responseText = await requestPlannerJson(provider, locale, schemaInstruction, prompt);
    return parsePlannerDay(responseText, dayNumber);
  });
}

export async function generateTripTips(
  provider: LlmProvider,
  params: TripSearchParams,
  locale: string,
  outline: PlannerOutline,
  days: DayPlan[],
): Promise<Array<{ category: string; text: string }>> {
  const schemaInstruction = buildPlannerTipsSchemaInstruction();
  const dayThemes = days.map((day) => `Day ${day.dayNumber}: ${day.theme}`).join('\n');
  const prompt = `${buildPlannerPrompt(params, locale)}

Trip overview:
- Summary: ${outline.summary}
- Weather: ${outline.weatherExpected}

Day themes:
${dayThemes}

Create practical travel tips for this itinerary.`;
  return withGenerationRetries(async () => {
    const responseText = await requestPlannerJson(provider, locale, schemaInstruction, prompt);
    return parsePlannerTips(responseText);
  });
}

export async function generateTripPlan(
  provider: LlmProvider,
  params: TripSearchParams,
  locale = 'pt-BR',
): Promise<PlannerResult> {
  validateSearchParams(params);
  const schemaInstruction = buildPlannerJsonSchemaInstruction();
  const prompt = buildPlannerPrompt(params, locale);

  return withGenerationRetries(async () => {
    const responseText = await requestPlannerJson(provider, locale, schemaInstruction, prompt);
    return parsePlannerResult(responseText, {
      destination: params.destination.trim(),
      durationDays: params.duration,
    });
  });
}

export function buildTripPlanFromGeneration(
  generated: PlannerResult,
  params: TripSearchParams,
  id = `trip_${Date.now()}`,
): TripPlan {
  return {
    ...generated,
    id,
    createdAt: new Date().toISOString(),
    budgetPreference: params.budget,
    stylePreference: params.style,
    companionPreference: params.companion,
  };
}

export async function persistAssembledTripPlan(
  db: AppDatabase,
  userId: string,
  params: TripSearchParams,
  outline: PlannerOutline,
  days: DayPlan[],
  tips: Array<{ category: string; text: string }>,
): Promise<TripPlan> {
  const generated = assemblePlannerResult(outline, days, tips);
  const plan = buildTripPlanFromGeneration(generated, params);
  return upsertTrip(db, userId, plan, params);
}

export async function generateAndPersistTripPlan(
  db: AppDatabase,
  userId: string,
  provider: LlmProvider,
  params: TripSearchParams,
  locale = 'pt-BR',
): Promise<TripPlan> {
  const generated = await generateTripPlan(provider, params, locale);
  const plan = buildTripPlanFromGeneration(generated, params);
  return upsertTrip(db, userId, plan, params);
}
