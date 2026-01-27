import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: `chromium`,
      use: {
        ...devices[`Desktop Chrome`],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        },
      },
    },
    {
      name: `firefox`,
      use: {
        ...devices[`Desktop Firefox`],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH,
        },
      },
    },
  ],
  reporter: `list`,
  retries: process.env.CI ? 2 : 0,
  testDir: `./test/e2e`,
  use: {
    baseURL: `http://localhost:5173`,
    trace: `off`,
  },
  webServer: {
    command: `VITE_API_ROOT=http://localhost:8000 bun run dev`,
    reuseExistingServer: !process.env.CI,
    url: `http://localhost:5173`,
  },
  workers: process.env.CI ? 1 : undefined,
});
