import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginSvelte from 'eslint-plugin-svelte';
import pluginPrettier from 'eslint-config-prettier';

export default [
  pluginJs.configs.recommended,
  pluginPrettier,
  ...pluginSvelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];
