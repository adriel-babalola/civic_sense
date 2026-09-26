import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/**
 * Flat config.
 *
 * Deliberately small. The React Compiler-era rules that matter here are the
 * hooks rules and `react-refresh/only-export-components`, plus `no-unused-vars`
 * — which is the one that actually catches dead code in a codebase this size.
 *
 * There is no stylistic layer. Formatting is not a correctness problem, and a
 * ruleset that argues about quotes is a ruleset people disable.
 */
export default [
  { ignores: ["dist", "node_modules"] },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // These two are not stylistic: without them ESLint cannot see that a
      // component referenced in JSX is used, and every page reports its own
      // imports as dead.
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",

      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "warn",

      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  {
    // Config and data modules are not components, so the refresh rule and the
    // component-oriented conventions do not apply to them.
    files: ["src/data/**/*.js", "src/utils/**/*.js", "src/services/**/*.js", "src/config/**/*.js"],
    rules: {
      "react-refresh/only-export-components": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },

  {
    // Build tooling and tests run in Node, not in a browser. Without this,
    // `process` in vite.config.js reads as an undefined global.
    files: ["*.config.js", "scripts/**/*.{js,mjs}", "test/**/*.{js,jsx}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
