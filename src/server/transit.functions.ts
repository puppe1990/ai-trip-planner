import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getGeminiClient } from '../lib/gemini';
import { searchTransit } from './transit.server';

export const searchTransitFn = createServerFn({ method: 'POST' })
  .validator(z.object({ destination: z.string(), locale: z.string().optional() }))
  .handler(async ({ data }) => {
    const client = getGeminiClient();
    return await searchTransit(client, data.destination, data.locale ?? 'pt-BR');
  });
