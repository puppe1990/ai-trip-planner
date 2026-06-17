import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSessionFn } from '@/src/server/auth.functions';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    return { session };
  },
  component: () => <Outlet />,
});