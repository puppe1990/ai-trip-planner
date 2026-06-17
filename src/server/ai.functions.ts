import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  getProviderApiKeyError,
  listProviderOptions,
  parseProviderId,
  resolveAiConfig,
  type AiConfig,
} from '../lib/ai-config';
import { getAuth } from '../lib/auth.server';
import { getDbReady } from '../lib/db/index';
import { assertNvidiaModelHosted } from '../lib/llm/nvidia-nim-catalog';
import { getUserAiPreferences, setUserAiPreferences } from './ai-preferences.server';

export type AiConfigResponse = AiConfig & {
  providers: ReturnType<typeof listProviderOptions>;
};

async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: getRequest().headers });
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

async function getAiConfigForUser(): Promise<AiConfigResponse> {
  const userId = await requireUserId();
  const db = await getDbReady();
  const preferences = await getUserAiPreferences(db, userId);
  const config = resolveAiConfig(preferences);

  return {
    ...config,
    providers: listProviderOptions(),
  };
}

export const getAiConfigFn = createServerFn({ method: 'GET' }).handler(async () => getAiConfigForUser());

export const updateAiConfigFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      providerId: z.enum(['gemini', 'nvidia-nim']),
      model: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const providerId = parseProviderId(data.providerId);
    const apiKeyError = getProviderApiKeyError(providerId);
    if (apiKeyError) throw new Error(apiKeyError);

    const defaults = listProviderOptions().find((provider) => provider.id === providerId);
    const model = data.model?.trim() || defaults?.defaultModel;
    if (!model) throw new Error('Model is required.');
    if (providerId === 'nvidia-nim') assertNvidiaModelHosted(model);

    const userId = await requireUserId();
    const db = await getDbReady();
    await setUserAiPreferences(db, userId, {
      providerId,
      model,
    });

    const preferences = await getUserAiPreferences(db, userId);
    return resolveAiConfig(preferences);
  });
