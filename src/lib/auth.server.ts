import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getDb, getDbReady } from './db/index';
import * as schema from './db/schema';

const isDev = process.env.NODE_ENV !== 'production';

function getTrustedOrigins(): string[] {
  const origins = new Set<string>();
  const configured = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  origins.add(configured);

  if (isDev) {
    origins.add('http://localhost:*');
    origins.add('http://127.0.0.1:*');
  }

  return [...origins];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any = null;

export async function getAuth() {
  if (!authInstance) {
    await getDbReady();
    const db = getDb();
    authInstance = betterAuth({
      database: drizzleAdapter(db, {
        provider: 'sqlite',
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }),
      baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
      basePath: '/api/auth',
      secret: process.env.BETTER_AUTH_SECRET ?? (isDev ? 'dev-only-trip-planner-secret' : undefined),
      emailAndPassword: { enabled: true, autoSignIn: true },
      trustedOrigins: getTrustedOrigins(),
      advanced: {
        disableOriginCheck: isDev,
        disableCSRFCheck: isDev,
      },
      plugins: [tanstackStartCookies()],
    });
  }
  return authInstance;
}

export function resetAuthForTests(): void {
  authInstance = null;
}