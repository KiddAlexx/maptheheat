import path from 'path';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
      sentryVitePlugin({
        org: 'maptheheat',
        project: 'maptheheat',
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        tests: path.resolve(__dirname, './tests'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: 'tests/setup.tsx',
      testTimeout: 15_000,
    },
    build: {
      sourcemap: 'hidden',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('@heroui') ||
                id.includes('@react-aria') ||
                id.includes('@react-stately')
              ) {
                return 'vendor-ui';
              }

              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }

              if (
                id.includes('@supabase') ||
                id.includes('realtime-js') ||
                id.includes('postgrest-js') ||
                id.includes('gotrue-js') ||
                id.includes('storage-js')
              ) {
                return 'vendor-supabase';
              }

              if (
                id.includes('@tanstack/react-query') ||
                id.includes('@tanstack/query-core')
              ) {
                return 'vendor-query';
              }

              if (id.includes('leaflet') || id.includes('react-leaflet')) {
                return 'vendor-map';
              }

              if (
                id.includes('filepond') ||
                id.includes('react-filepond') ||
                id.includes('filepond-plugin-image-preview') ||
                id.includes('filepond-plugin-image-exif-orientation')
              ) {
                return 'vendor-filepond';
              }
            }
          },
        },
      },
    },
  };
});
