import { buildPlannerJsonSchemaInstruction } from '../lib/planner-json-instructions';
import { parsePlannerResult } from '../lib/planner-zod-schema';
import { getGeminiLanguage } from '../i18n/index';
import type { LlmProvider } from '../lib/llm/types';
import type { DayPlan, TripSearchParams } from '../types';

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

export interface PlannerResult {
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
  days: DayPlan[];
  tips: Array<{ category: string; text: string }>;
}

export async function generateTripPlan(
  provider: LlmProvider,
  params: TripSearchParams,
  locale = 'pt-BR',
): Promise<PlannerResult> {
  validateSearchParams(params);

  const lang = getGeminiLanguage(locale);
  const systemInstruction =
    lang === 'en'
      ? 'You are a professional travel guide. Create logical, detailed itineraries with authentic local experiences. Respond strictly in the provided JSON schema and in English.'
      : 'Você é um guia turístico profissional. Crie itinerários lógicos e detalhados com experiências locais autênticas. Responda estritamente no schema JSON fornecido e em Português (pt-BR).';

  const schemaInstruction = buildPlannerJsonSchemaInstruction();
  const promptMsg = `${buildPlannerPrompt(params, locale)}\n\n${schemaInstruction}`;
  const fullSystemInstruction = `${systemInstruction}\n\n${schemaInstruction}`;
  let delay = 1500;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const responseText = await provider.generateJson({
        system: fullSystemInstruction,
        prompt: promptMsg,
        temperature: 0.8,
      });

      if (!responseText) throw new Error('No content returned by model.');

      return parsePlannerResult(responseText, {
        destination: params.destination.trim(),
        durationDays: params.duration,
      });
    } catch (error: unknown) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error('No content returned by model.');
}
