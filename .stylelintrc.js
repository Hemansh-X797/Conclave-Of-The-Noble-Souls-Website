// .stylelintrc.js

module.exports = {
  extends: [
    'stylelint-config-standard',             // Base rules
    'stylelint-config-prettier',             // Turn off rules that conflict with Prettier
    'stylelint-config-tailwindcss',          // Tailwind CSS class-aware linting
  ],
  plugins: ['stylelint-order'],
  rules: {
    // Formatting & structure
    'string-quotes': 'single',
    'block-no-empty': true,
    'declaration-block-no-duplicate-properties': true,
    'no-empty-source': null,
    'declaration-empty-line-before': null,

    // Custom project-specific rules
    'selector-class-pattern': [
      '^[a-z0-9\\-]+$', {
        message: 'Class names should be kebab-case (no camelCase or PascalCase)',
      }
    ],
    
    // Property ordering
    'order/order': [
      'custom-properties',
      'dollar-variables',
      'declarations',
      {
        type: 'at-rule',
        name: 'supports'
      },
      {
        type: 'at-rule',
        name: 'media'
      },
      'rules'
    ],
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'flex',
      'flex-grow',
      'flex-shrink',
      'flex-direction',
      'justify-content',
      'align-items',
      'gap',
      'width',
      'height',
      'max-width',
      'max-height',
      'padding',
      'margin',
      'border',
      'border-radius',
      'background',
      'box-shadow',
      'color',
      'font',
      'font-size',
      'font-weight',
      'text-align',
      'line-height',
      'transition',
      'animation',
      'cursor'
    ],

    // Tailwind & Utility Specifics
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': null, // Disable if using lots of custom classnames like `lux-glass`
  },
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    '**/*.md',
    '**/*.json',
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
  ],
};
