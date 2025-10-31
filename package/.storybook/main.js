// .storybook/main.js
module.exports = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)', // Component stories
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',         // for switching between noble/dark themes
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
};
