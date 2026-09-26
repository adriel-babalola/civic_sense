import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Vitest runs through the same Vite config as the app, so a test failure means
 * a real failure rather than a difference between two build pipelines.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.js"],
    include: ["test/**/*.test.{js,jsx}"],
    restoreMocks: true,
  },
});
