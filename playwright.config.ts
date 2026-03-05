import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';

// Function to find chromium executable in the system path
const findChromium = () => {
  try {
    return execSync('which chromium').toString().trim();
  } catch {
    return undefined;
  }
};

const chromiumPath = findChromium();

// Read port from environment variables or default to 5173
const port = process.env.PORT || '5173';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: chromiumPath,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
