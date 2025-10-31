// .eslintrc.js

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/react',
    'plugin:tailwindcss/recommended',
    'plugin:security/recommended',
    'plugin:sonarjs/recommended',
    'plugin:promise/recommended',
    'plugin:eslint-comments/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'tailwindcss',
    'unused-imports',
    'security',
    'sonarjs',
    'promise',
    'eslint-comments',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  rules: {
    // --- Core
    'no-console': isProd ? 'error' : 'warn',
    'no-debugger': isProd ? 'error' : 'warn',
    'no-alert': 'warn',

    // --- Unused imports/vars
    'unused-imports/no-unused-imports': 'error',
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // --- React
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',

    // --- React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // --- Import order
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

    // --- Tailwind
    'tailwindcss/no-custom-classname': 'off',

    // --- Promise handling
    'promise/always-return': 'off',
    'promise/catch-or-return': 'warn',
    'promise/no-nesting': 'warn',

    // --- SonarJS
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-identical-functions': 'warn',

    // --- ESLint comments
    'eslint-comments/no-unused-disable': 'error',

    // --- Accessibility
    'jsx-a11y/anchor-is-valid': 'off', // Next.js handles this with <Link>

    // --- Security
    'security/detect-object-injection': 'off', // optional depending on usage

    // --- Developer Experience
    'prefer-const': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
      alias: {
        map: [['@', './src']],
        extensions: ['.js', '.jsx'],
      },
    },
  },
  overrides: [
    {
      files: ['**/api/**', '**/lib/**'],
      rules: {
        'no-console': 'off',
        'security/detect-non-literal-fs-filename': 'off',
      },
    },
    {
      files: ['**/__tests__/**', '**/*.test.js'],
      env: { jest: true },
    },
  ],
};
