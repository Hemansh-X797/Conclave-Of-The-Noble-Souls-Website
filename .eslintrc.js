module.exports = {
  // ============================================
  // CORE SETTINGS
  // ============================================
  root: true,

  parser: 'espree',

  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  // ============================================
  // ENVIRONMENTS
  // ============================================
  env: {
    browser: true,
    es2024: true,
    node: true,
  },

  // ============================================
  // EXTENDS (Base configurations)
  // ============================================
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],

  // ============================================
  // PLUGINS
  // ============================================
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
  ],

  // ============================================
  // GLOBAL SETTINGS
  // ============================================
  settings: {
    react: {
      version: 'detect',
    },
  },

  // ============================================
  // RULES
  // ============================================
  rules: {
    // React-specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/jsx-key': 'warn',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-children-prop': 'warn',
    'react/no-danger': 'warn',
    'react/no-deprecated': 'warn',
    'react/no-unescaped-entities': 'off',
    'react/self-closing-comp': 'warn',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Accessibility rules
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-is-valid': 'off', // Next.js Link component
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',

    // JavaScript rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn',
    'arrow-body-style': ['warn', 'as-needed'],
    'no-duplicate-imports': 'error',
    'no-multiple-empty-lines': ['warn', { max: 1 }],
    'eqeqeq': ['error', 'always'],
    'curly': ['warn', 'all'],
    'brace-style': ['warn', '1tbs'],

    // Next.js specific rules
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'warn',
    '@next/next/no-sync-scripts': 'error',
    '@next/next/no-document-import-in-page': 'error',
  },

  // ============================================
  // FILE-SPECIFIC OVERRIDES
  // ============================================
  overrides: [
    // Configuration files
    {
      files: ['*.config.js', '*.config.mjs'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },

    // Test files
    {
      files: ['**/__tests__/**/*', '**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },

    // API routes
    {
      files: ['src/app/api/**/*.js', 'src/pages/api/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },

    // Scripts
    {
      files: ['scripts/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },

    // Unused disable directives configuration
    {
      files: ['**/*.js', '**/*.ts'],
      linterOptions: {
      },
    },
  ],

  // ============================================
  // IGNORE PATTERNS (replaces .eslintignore)
  // ============================================
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    'dist/',
    'public/',
    '*.min.js',
    'coverage/',
    '.vercel/',
    '.turbo/',
    '*.config.js', // Already in overrides
  ],
};
