import { defineConfig } from "vitest/config"

export default defineConfig({
  test: { globalSetup: ["./src/globalSetup.mts"] },
})
