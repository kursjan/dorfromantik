/// <reference types="vitest/config" />
/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load ALL environment variables from .env (even those without VITE_ prefix)
  const env = loadEnv(mode, process.cwd(), '');
  const targetPort = parseInt(env.PORT || '5173');

  return {
    // 1. Unified Port for Dev and Preview
    server: {
      port: targetPort,
      strictPort: true,
    },
    preview: {
      port: targetPort,
      strictPort: true,
    },

    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      // 2. Ensure tests can see the same .env variables
      env: env,
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
      projects: [
        {
          test: {
            name: 'unit',
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/test/setup.ts',
            include: ['src/**/*.test.{ts,tsx}'],
          },
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
            }),
          ],
          test: {
            name: 'storybook',
            /** Chromium + parallel story mounts can exceed 15s on cold CI / pre-push runs. */
            testTimeout: 45_000,
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [{ browser: 'chromium' }],
            },
            setupFiles: ['.storybook/vitest.setup.ts'],
          },
        },
      ],
    },
  };
});
