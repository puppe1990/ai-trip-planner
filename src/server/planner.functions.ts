import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getGeminiClient } from '../lib/gemini';
import { generateTripPlan, ValidationError } from './planner.server';

const tripSearchParamsSchema = z.object({
  destination: z.string(),
  duration: z.number(),
  budget: z.string(),
  style: z.string(),
  companion: z.string(),
  season: z.string(),
  extraNotes: z.string(),
});

export const generateTripPlanFn = createServerFn({ method: 'POST' })
  .validator(z.object({ params: tripSearchParamsSchema, locale: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      const client = getGeminiClient();
      return await generateTripPlan(client, data.params, data.locale ?? 'pt-BR');
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(error.message);
      }
      const message = error instanceof Error ? error.message : 'Internal server error';
      throw new Error(message);
    }
  });