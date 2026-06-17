import { signOut } from './auth-client';

type SignOutAndRedirectOptions = {
  navigate: (options: { to: string }) => Promise<void> | void;
  invalidate?: () => Promise<void>;
};

export async function signOutAndRedirect({ navigate, invalidate }: SignOutAndRedirectOptions) {
  const result = await signOut();

  if (result.error) {
    throw new Error(result.error.message ?? 'Failed to sign out');
  }

  if (invalidate) {
    await invalidate();
  }

  await navigate({ to: '/login' });
}
