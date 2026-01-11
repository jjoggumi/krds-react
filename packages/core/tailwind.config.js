/** @type {import('tailwindcss').Config} */
import base from '../../tailwind.config.js';

export default {
  ...base,
  content: ['./lib/**/*.{js,ts,jsx,tsx}'],
};
