import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getLlmProviderForUser } from './ai-llm.server';
import { searchTransit } from './transit.server';

export const searchTransitFn = createServerFn({ method: 'POST' })
  .validator(z.object({ destination: z.string(), locale: z.string().optional() }))
  .handler(async ({ data }) => {
    const provider = await getLlmProviderForUser();
    return await searchTransit(provider, data.destination, data.locale ?? 'pt-BR');
  });
