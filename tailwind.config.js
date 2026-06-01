/** @type {import('tailwindcss').Config} */
const theme = require('./tailwind.theme.js')
const tokens = require('./tailwind.tokens.js')

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      ...theme.extend,
      colors: {
        ...theme.colors,
        ...(theme.extend?.colors ?? {}),
        'lesson-page': tokens['Specially-Tokens-Background-lesson-page'].light,
      },
    },
  },
  plugins: [],
}
