import config from "@skazakov/eslint-config"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...config,
  { ignores: ["src/generated/**"] },
  {
    rules: {
      "unicorn/no-top-level-side-effects": "off",
      "unicorn/no-unreadable-object-destructuring": "off",
    },
  },
])
