import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    globals: false,
    reporter: "verbose",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
