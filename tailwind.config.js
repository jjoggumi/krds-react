/** @type {import('tailwindcss').Config} */
import krdsPlugin from '@krds-ui/tailwindcss-plugin';

export default {
  content: [
    './app/**/*.{html,js,ts,jsx,tsx}',
    './examples/**/*.{html,js,ts,jsx,tsx}',
    './packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {},
  plugins: [krdsPlugin],
};
