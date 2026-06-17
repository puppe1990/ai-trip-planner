import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { getAuth } from '../lib/auth.server';
import { getDbReady } from '../lib/db/index';
import { getLlmProviderForUser } from './ai-llm.server';
import { generateAndPersistTripPlan, ValidationError } from './planner.server';

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
      const auth = await getAuth();
      const session = await auth.api.getSession({ headers: getRequest().headers });
      if (!session?.user?.id) throw new Error('Unauthorized');

      const provider = await getLlmProviderForUser();
      const db = await getDbReady();
      return await generateAndPersistTripPlan(db, session.user.id, provider, data.params, data.locale ?? 'pt-BR');
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(error.message);
      }
      const message = error instanceof Error ? error.message : 'Internal server error';
      throw new Error(message);
    }
  });
