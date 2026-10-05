import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'docs/**',
      '.cursor/**',
      'apps/api/openapi.json',
      'apps/api/src/generated/**',
      'apps/web/src/api/schema.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/api/**/*.{ts,js}', 'apps/api/**/*.mts', 'prisma.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // Nest DI / emitDecoratorMetadata: value imports for decorated classes
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    files: ['apps/web/**/*.{ts,js}', 'apps/web/**/*.mts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: globals.browser,
    },
  },
  eslintConfigPrettier,
);
