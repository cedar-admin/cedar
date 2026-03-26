const config = require('config/tailwind.config')

module.exports = config({
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{tsx,ts,js}',
    '../../packages/ui-patterns/src/**/*.{tsx,ts,js}',
  ],
  theme: {
    extend: {},
  },
})
