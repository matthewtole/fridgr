import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // JSX framework
  jsxFramework: 'react',

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './.storybook/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          lemon: { value: '#fbf8cc' },
          peach: { value: '#fde4cf' },
          rose: { value: '#ffcfd2' },
          orchid: { value: '#f1c0e8' },
          mauve: { value: '#cfbaf0' },
          sky: { value: '#a3c4f3' },
          frost: { value: '#90dbf4' },
          aqua: { value: '#8eecf5' },
          aquamarine: { value: '#98f5e1' },
          mint: { value: '#b9fbc0' },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
})
