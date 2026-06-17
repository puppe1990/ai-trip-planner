import { getRequest } from '@tanstack/react-start/server';
import { resolveAiConfig } from '../lib/ai-config.server';
import { getAuth } from '../lib/auth.server';
import { getDbReady } from '../lib/db/index';
import { getLlmProvider } from '../lib/llm/factory';
import type { LlmProvider } from '../lib/llm/types';
import { getUserAiPreferences } from './ai-preferences.server';

export async function getLlmProviderForUser(): Promise<LlmProvider> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: getRequest().headers });
  if (!session?.user?.id) return getLlmProvider();

  const db = await getDbReady();
  const preferences = await getUserAiPreferences(db, session.user.id);
  const config = resolveAiConfig(preferences);
  return getLlmProvider(config);
}
