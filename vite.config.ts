import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
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
  },
  build: {
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
});
