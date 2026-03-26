const { defineConfig } = require('eslint/config')

module.exports = defineConfig([
  {
    files: ['registry/**/*.tsx', '__registry__/**/*.tsx', 'app/**/*.tsx'],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
])
