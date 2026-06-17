import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import appCss from '@/src/index.css?url';
import '@/src/i18n';
import { getAppFaviconHref } from '@/src/lib/app-favicon';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'TripPlanner IA' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: getAppFaviconHref(), type: 'image/svg+xml' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-800">404</h1>
      <p className="text-slate-500">{t('errors.genericError')}</p>
      <Link to="/" className="text-indigo-600 font-semibold hover:underline">
        {t('common.appName')}
      </Link>
    </div>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-50/50 text-slate-800 font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
