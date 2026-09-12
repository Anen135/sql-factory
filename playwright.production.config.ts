import { defineConfig } from '@playwright/test';
process.env.PRODUCTION_TEST = '1';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'production.spec.ts',
  use: { baseURL: 'http://127.0.0.1:4174', channel: 'msedge', headless: true },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174 --base /sql-factory/',
    url: 'http://127.0.0.1:4174/sql-factory/',
    reuseExistingServer: true,
  },
  reporter: 'list',
});
