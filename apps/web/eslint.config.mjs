import pluginTailwindCSS from 'eslint-plugin-tailwindcss';

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      tailwindcss: pluginTailwindCSS,
    },
    rules: {
      // Block arbitrary Tailwind values — forces all values through the token system
      'tailwindcss/no-arbitrary-value': 'warn',
      
      // Enforce consistent Tailwind class ordering
      'tailwindcss/classnames-order': 'warn',
      
      // Flag invalid Tailwind classes
      'tailwindcss/no-custom-classname': 'off', // Off — we have custom utility classes in globals.css
    },
    settings: {
      tailwindcss: {
        // Allow our custom utility classes
        whitelist: [
          'animate-panel-in-right',
          'animate-panel-out-right',
          'animate-panel-in-left',
          'animate-panel-out-left',
          'animate-scrim-in',
          'animate-scrim-out',
          'animate-fade-in',
          'animate-fade-out',
          'animate-scale-in',
          'animate-scale-out',
          'transition-interactive',
          'transition-transform',
          'radius-nested',
        ],
      },
    },
  },
  {
    // Don't lint generated files
    ignores: ['node_modules/**', '.next/**', 'dist/**', 'lib/db/types.ts'],
  },
];
