/** @type {import('tailwindcss').Config} */

const { nextui } = require('@nextui-org/theme');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/components/(button|snippet|code|input).js',
  ],
  theme: {
    extend: {},
  },
  plugins: [nextui()],
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
};
