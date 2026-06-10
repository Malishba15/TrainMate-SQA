import { defineConfig } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.join(__dirname, "tests", "e2e"),
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm start",
    cwd: path.join(__dirname, "..", "frontend"),
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});