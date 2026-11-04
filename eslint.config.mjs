import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "public/**",
      "node_modules/**",
      "brand/**",
      "docs/**",
      "coverage/**",
      "dist/**",
      "_site/**",
      ".wrangler/**"
    ]
  },
  {
    files: ["src/assets/js/**/*.js", "worker/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        // Provided by the page <head> (Google Analytics) and the GSAP CDN script.
        dataLayer: "readonly",
        gsap: "readonly",
        gtag: "readonly"
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off",
      "no-undef": "error",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          varsIgnorePattern: "^_"
        }
      ]
    }
  }
];
