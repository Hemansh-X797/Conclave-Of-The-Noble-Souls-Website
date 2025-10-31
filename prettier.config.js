/** @type {import('prettier').Config} */
module.exports = {
  // General formatting
  printWidth: 100,              // Wider lines for complex JSX
  tabWidth: 2,                  // Standard indentation
  useTabs: false,               // Spaces are more universal
  semi: true,                   // Keep semicolons for clarity
  singleQuote: true,           // Prefer single quotes
  quoteProps: 'preserve',      // Keep object quotes as written
  jsxSingleQuote: false,       // JSX uses double quotes by convention
  trailingComma: 'all',        // Helps with cleaner diffs
  bracketSpacing: true,        // { foo: bar }
  bracketSameLine: false,      // Puts JSX closing `>` on new line
  arrowParens: 'always',       // Always use parens for consistency
  proseWrap: 'always',         // Wrap markdown for better readability
  endOfLine: 'lf',             // Normalize across OSes
  embeddedLanguageFormatting: 'auto', // Format embedded code
  htmlWhitespaceSensitivity: 'ignore', // For Tailwind spacing quirks

  // File handling
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        proseWrap: 'always',
      },
    },
    {
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.json', '*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
      },
    },
    {
      files: ['*.jsx', '*.tsx'],
      options: {
        printWidth: 100,
      },
    },
  ],

  // Optional plugins (you can add them per need)
  plugins: [
    'prettier-plugin-tailwindcss',     // Sort Tailwind classes
    'prettier-plugin-organize-imports',// Auto-sort imports
    'prettier-plugin-packagejson',     // Sort package.json keys
  ],
};
