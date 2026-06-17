import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import type { AppDatabase } from '../lib/db/index';
import { createTestDb, destroyTestDb } from '../test/db';
import type { Client } from '@libsql/client';
import { user } from '../lib/db/schema';
import { listTrips, saveTrip, deleteTrip, DuplicateTripError } from './trips.server';
import type { TripPlan } from '../types';

async function seedUser(db: AppDatabase, id: string, email: string) {
  const now = new Date();
  await db.insert(user).values({
    id,
    name: `User ${id}`,
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
}

const samplePlan = (id: string, destination: string, days = 3): TripPlan => ({
  id,
  destination,
  durationDays: days,
  tagline: 'Test',
  summary: 'Summary',
  budgetEstimate: {
    totalCostEstimate: 'R$ 1000',
    hotelAverageNight: 'R$ 100',
    foodAverageDay: 'R$ 50',
    transportAverageDay: 'R$ 20',
  },
  packingEssentials: [],
  weatherExpected: 'Mild',
  days: [],
  tips: [],
  createdAt: new Date().toISOString(),
});

describe('trips.server', () => {
  let db: AppDatabase;
  let client: Client;
  let dbPath: string;
  const userA = 'user-a';
  const userB = 'user-b';

  beforeEach(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;
    dbPath = testDb.dbPath;
    await seedUser(db, userA, 'a@test.com');
    await seedUser(db, userB, 'b@test.com');
  });

  afterEach(() => {
    destroyTestDb(client, dbPath);
  });

  it('saves and lists trips for a user', async () => {
    const plan = samplePlan('trip_1', 'Paris, França');
    await saveTrip(db, userA, plan);
    const trips = await listTrips(db, userA);
    expect(trips).toHaveLength(1);
    expect(trips[0].destination).toBe('Paris, França');
  });

  it('prevents duplicate destination+duration for same user', async () => {
    await saveTrip(db, userA, samplePlan('trip_1', 'Roma, Itália', 4));
    await expect(saveTrip(db, userA, samplePlan('trip_2', 'Roma, Itália', 4))).rejects.toBeInstanceOf(
      DuplicateTripError,
    );
  });

  it('isolates trips between users', async () => {
    await saveTrip(db, userA, samplePlan('trip_a', 'Lisboa'));
    await saveTrip(db, userB, samplePlan('trip_b', 'Madrid'));
    expect(await listTrips(db, userA)).toHaveLength(1);
    expect(await listTrips(db, userB)).toHaveLength(1);
  });

  it('deletes trip by id for owner only', async () => {
    const plan = samplePlan('trip_del', 'Berlim');
    await saveTrip(db, userA, plan);
    expect(await deleteTrip(db, userA, 'trip_del')).toBe(true);
    expect(await listTrips(db, userA)).toHaveLength(0);
    expect(await deleteTrip(db, userB, 'trip_del')).toBe(false);
  });
});
