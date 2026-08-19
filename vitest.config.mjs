import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globalSetup: ["./tests/globalSetup.mts"],
    sequence: { concurrent: true },
  },
})
