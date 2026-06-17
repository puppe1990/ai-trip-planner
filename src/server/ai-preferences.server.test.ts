import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { user } from '../lib/db/schema';
import { createTestDb, destroyTestDb } from '../test/db';
import { getUserAiPreferences, setUserAiPreferences } from './ai-preferences.server';

describe('ai-preferences.server', () => {
  const dbs: Array<ReturnType<typeof createTestDb> extends Promise<infer T> ? T : never> = [];

  afterEach(async () => {
    while (dbs.length) {
      const { client, dbPath } = dbs.pop()!;
      destroyTestDb(client, dbPath);
    }
  });

  async function seedUser(id = 'user-1') {
    const ctx = await createTestDb();
    dbs.push(ctx);
    const now = new Date();
    await ctx.db.insert(user).values({
      id,
      name: 'Test User',
      email: `${id}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
    return ctx;
  }

  it('returns null preferences for new user', async () => {
    const { db } = await seedUser();

    expect(await getUserAiPreferences(db, 'user-1')).toBeNull();
  });

  it('saves and reads provider preference', async () => {
    const { db } = await seedUser();

    await setUserAiPreferences(db, 'user-1', { providerId: 'nvidia-nim' });

    expect(await getUserAiPreferences(db, 'user-1')).toEqual({
      providerId: 'nvidia-nim',
      model: null,
    });
  });

  it('saves provider and model together', async () => {
    const { db } = await seedUser();

    await setUserAiPreferences(db, 'user-1', {
      providerId: 'gemini',
      model: 'gemini-custom',
    });

    expect(await getUserAiPreferences(db, 'user-1')).toEqual({
      providerId: 'gemini',
      model: 'gemini-custom',
    });
  });

  it('overwrites previous preference', async () => {
    const { db } = await seedUser();

    await setUserAiPreferences(db, 'user-1', { providerId: 'gemini', model: 'a' });
    await setUserAiPreferences(db, 'user-1', { providerId: 'nvidia-nim' });

    const row = await db.select().from(user).where(eq(user.id, 'user-1'));
    expect(row[0]?.aiProviderId).toBe('nvidia-nim');
    expect(row[0]?.aiModel).toBeNull();
  });
});
