import eslint from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended'],
    ],
    plugins: {
      '@stylistic': stylistic,
    },
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      // your rules
      "curly": ['error'],

      // Please don't use console statements and duplicated imports, TODOs are marked
      "no-console": ['warn', { allow: ['warn', 'error'] }],
      "no-warning-comments": ['warn'],
      "no-duplicate-imports": ['warn'],

      // Prevent errors when testing on refs (instead of value of ref)
      "vue/no-ref-as-operand": ['error'],

      // Indentation
      "@stylistic/indent": ['warn', 4, { "SwitchCase": 0 }],
      "vue/html-indent": ['warn', 4],
      "vue/script-indent": ['warn', 4],
      "@stylistic/no-mixed-spaces-and-tabs": ["error", "smart-tabs"],

      // Number of attributes per line (increase because sometimes two is not a lot)
      "vue/max-attributes-per-line": ['warn', { singleline: 2 } ]
    }
  }
);
