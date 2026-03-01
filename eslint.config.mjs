import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  {
    files: ['./Task**/**/*.{js,mjs,cjs}'],
    plugins: { js },
    rules: {
      ...js.configs.recommended.rules,
      semi: ['error', 'always'],
    },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  prettier,
  {
    files: ['Task*/**/*.test.js'],
    ...jest.configs['flat/recommended'],
  },
]);
