import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { getAuth } from '../lib/auth.server';
import { getDbReady } from '../lib/db/index';
import type { TripPlan } from '../types';
import { deleteTrip, DuplicateTripError, listTrips, saveTrip } from './trips.server';

const tripSearchParamsSchema = z.object({
  destination: z.string(),
  duration: z.number(),
  budget: z.string(),
  style: z.string(),
  companion: z.string(),
  season: z.string(),
  extraNotes: z.string(),
});

async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: getRequest().headers });
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

export const listTripsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const userId = await requireUserId();
  const db = await getDbReady();
  return await listTrips(db, userId);
});

export const saveTripFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      plan: z.custom<TripPlan>((val) => typeof val === 'object' && val !== null),
      searchParams: tripSearchParamsSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const db = await getDbReady();
    try {
      await saveTrip(db, userId, data.plan, data.searchParams);
      return { success: true };
    } catch (error) {
      if (error instanceof DuplicateTripError) return { success: false, duplicate: true };
      throw error;
    }
  });

export const deleteTripFn = createServerFn({ method: 'POST' })
  .validator(z.object({ tripId: z.string() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const db = await getDbReady();
    await deleteTrip(db, userId, data.tripId);
    return { success: true };
  });
