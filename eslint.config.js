import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['docs/assets/**', 'coverage/**', 'node_modules/**', 'playwright-report/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        __APP_VERSION__: 'readonly',
        __COMMIT_SHA__: 'readonly',
        __REPO_URL__: 'readonly',
        __PAYPAL_URL__: 'readonly',
        __PAGES_URL__: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        Worker: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  prettier,
];

