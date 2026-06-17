import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../lib/db/index';
import { user } from '../lib/db/schema';
import { parseProviderId, type UserAiPreferences } from '../lib/ai-config';
import type { LlmProviderId } from '../lib/llm/types';

export async function getUserAiPreferences(db: AppDatabase, userId: string): Promise<UserAiPreferences | null> {
  const rows = await db
    .select({ aiProviderId: user.aiProviderId, aiModel: user.aiModel })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row?.aiProviderId) return null;

  return {
    providerId: parseProviderId(row.aiProviderId),
    model: row.aiModel,
  };
}

export async function setUserAiPreferences(
  db: AppDatabase,
  userId: string,
  preferences: { providerId: LlmProviderId; model?: string | null },
): Promise<void> {
  const model = preferences.model?.trim() ? preferences.model.trim() : null;

  await db
    .update(user)
    .set({
      aiProviderId: preferences.providerId,
      aiModel: model,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}
