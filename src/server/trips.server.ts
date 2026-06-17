import { and, desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../lib/db/index';
import { savedTrips } from '../lib/db/schema';
import type { TripPlan, TripSearchParams } from '../types';

export class DuplicateTripError extends Error {
  constructor() {
    super('Trip already saved');
    this.name = 'DuplicateTripError';
  }
}

export async function listTrips(db: AppDatabase, userId: string): Promise<TripPlan[]> {
  const rows = await db
    .select()
    .from(savedTrips)
    .where(eq(savedTrips.userId, userId))
    .orderBy(desc(savedTrips.createdAt));
  return rows.map((row) => row.planJson);
}

export async function saveTrip(
  db: AppDatabase,
  userId: string,
  plan: TripPlan,
  searchParams?: TripSearchParams,
): Promise<void> {
  const existing = await db
    .select({ id: savedTrips.id })
    .from(savedTrips)
    .where(
      and(
        eq(savedTrips.userId, userId),
        eq(savedTrips.destination, plan.destination),
        eq(savedTrips.durationDays, plan.durationDays),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new DuplicateTripError();
  }

  await db.insert(savedTrips).values({
    id: plan.id,
    userId,
    destination: plan.destination,
    durationDays: plan.durationDays,
    tagline: plan.tagline,
    planJson: plan,
    searchParamsJson: searchParams ?? null,
  });
}

export async function deleteTrip(db: AppDatabase, userId: string, tripId: string): Promise<boolean> {
  const result = await db
    .delete(savedTrips)
    .where(and(eq(savedTrips.id, tripId), eq(savedTrips.userId, userId)));
  return (result.rowsAffected ?? 0) > 0;
}