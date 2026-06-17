import tailwindcss from '@tailwindcss/vite';
import netlify from '@netlify/vite-plugin-tanstack-start';
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      router: {
        routesDirectory: 'app',
        generatedRouteTree: './routeTree.gen.ts',
        routeFileIgnorePattern: '\\.test\\.',
      },
    }),
    netlify(),
    react(),
    tailwindcss(),
  ],
});
