// eslint.config.mjs
import pluginNext from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'eslint.config.mjs',
      'src/prisma/jobs/.generated/**',
      'src/prisma/site/.generated/**',
      '**/*.d.ts',
    ],
  },

  // Configuration for script files (no TypeScript project)
  {
    name: 'ESLint Config - scripts',
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-multi-spaces': ['error'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-trailing-spaces': ['error'],
    },
  },

  // Next.js configuration for main project files
  {
    name: 'ESLint Config - nextjs',
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@next/next': pluginNext,
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
    },
    files: ['src/**/*.{js,jsx,ts,tsx}', '*.{js,jsx,ts,tsx}'],
    ignores: ['scripts/**'],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', '.'],
        },
      },
      'import/core-modules': ['node:util', 'node:fs', 'node:path', 'node:crypto', 'node:os'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/ignore': ['node_modules', '\\.css$', '\\.svg$', '\\.(png|jpg|jpeg|gif|webp)$'],
      'next': {
        rootDir: '.',
      },
    },
    rules: {
      // Next.js plugin rules
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,

      // Basic formatting rules
      'quotes': [
        'error',
        'single',
        {
          'avoidEscape': true,
          'allowTemplateLiterals': true,
        }
      ],
      'semi': [
        'error',
        'always'
      ],
      'no-multi-spaces': [
        'error',
        {
          'ignoreEOLComments': true
        }
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          'max': 1,
          'maxEOF': 1,
          'maxBOF': 0
        }
      ],
      'no-trailing-spaces': [
        'error',
      ],

      // TypeScript specific rules
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',

      // Type import/export rules - these enforce the `type` keyword
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: true
        }
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier: true
        }
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Unused imports removal (replacing no-unused-vars)
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          'checksVoidReturn': {
            'attributes': false
          }
        }
      ],

      // Import plugin rules - letting Prettier organize imports
      'import/no-duplicates': 'error',
      'import/order': 'off', // Turn off to avoid conflicts with prettier-plugin-organize-imports
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
    },
  },
];