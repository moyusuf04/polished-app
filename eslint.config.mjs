import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "default",
          "format": ["camelCase"],
          "leadingUnderscore": "allow",
          "trailingUnderscore": "allow"
        },
        {
          "selector": "variable",
          "format": ["camelCase", "UPPER_CASE", "PascalCase"],
          "leadingUnderscore": "allow",
          "trailingUnderscore": "allow"
        },
        {
          "selector": "function",
          "format": ["camelCase", "PascalCase"]
        },
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        },
        {
          "selector": "property",
          "format": ["camelCase", "snake_case", "PascalCase"],
          "filter": {
            "regex": "^[a-zA-Z]([a-zA-Z0-9_]*)$",
            "match": false
          }
        },
        {
          "selector": "parameter",
          "format": ["camelCase", "snake_case"],
          "leadingUnderscore": "allow"
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
