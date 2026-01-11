/** @type {import('tailwindcss').Config} */
import base from '../../tailwind.config.js';

export default {
  ...base,
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
