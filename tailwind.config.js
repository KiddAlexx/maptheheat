// tailwind.config.mjs
import { heroui } from '@heroui/react';
import containerQueries from '@tailwindcss/container-queries';
import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // overrides Tailwind's default sans
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        ring: 'hsl(var(--heroui-primary) / <alpha-value>)',
        'app-card':    'rgb(var(--app-card) / <alpha-value>)',
        'app-border':  'rgb(var(--app-border) / <alpha-value>)',
        'app-surface': 'rgb(var(--app-surface) / <alpha-value>)',
        'app-muted':   'rgb(var(--app-muted) / <alpha-value>)',
      },
      /*  colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      }, */
    },
  },
  darkMode: ['class'],
  plugins: [
    containerQueries,
    heroui({
      addCommonColors: true,
      themes: {
        light: {
          colors: {
            focus: 'rgba(246, 138, 81, 1  )',
            primary: {
              50: '#fef5ee',
              100: '#fee9d6',
              200: '#fbcfad',
              300: '#f9ac78',
              400: '#f68a51',
              500: '#f25e1d',
              600: '#e34413',
              700: '#bc3112',
              800: '#962916',
              900: '#792515',
              950: '#410f09',
              DEFAULT: '#f68a51',
              foreground: '#410f09',
            },
            danger: {
              50: '#fff1f1',
              100: '#FFE8E1',
              200: '#FFCDC3',
              300: '#FFACA4',
              400: '#FF8E8F',
              500: '#FF6978',
              600: '#DB4C68',
              700: '#B73459',
              800: '#93214C',
              900: '#7A1443',
              950: '#4e0315',
              DEFAULT: '#FF6978',
              foreground: '#4e0315',
            },
            success: {
              50: '#f1fcf1',
              100: '#EDFDE6',
              200: '#D7FCCD',
              300: '#BAF7B2',
              400: '#9FEF9C',
              500: '#7BE581',
              600: '#59C469',
              700: '#3DA456',
              800: '#278445',
              900: '#176D3B',
              950: '#184f1d',
              DEFAULT: '#7BE581',
              foreground: '#184f1d',
            },
          },
        },
        dark: {
          colors: {
            focus: 'rgba(246, 138, 81, 1)',
            primary: {
              50: '#fef5ee',
              100: '#fee9d6',
              200: '#fbcfad',
              300: '#f9ac78',
              400: '#f68a51',
              500: '#f25e1d',
              600: '#e34413',
              700: '#bc3112',
              800: '#962916',
              900: '#792515',
              950: '#410f09',
              DEFAULT: '#f68a51',
              foreground: '#410f09',
            },
            danger: {
              50: '#fff1f1',
              100: '#FFE8E1',
              200: '#FFCDC3',
              300: '#FFACA4',
              400: '#FF8E8F',
              500: '#FF6978',
              600: '#DB4C68',
              700: '#B73459',
              800: '#93214C',
              900: '#7A1443',
              950: '#4e0315',
              DEFAULT: '#FF6978',
              foreground: '#4e0315',
            },
            success: {
              50: '#f1fcf1',
              100: '#EDFDE6',
              200: '#D7FCCD',
              300: '#BAF7B2',
              400: '#9FEF9C',
              500: '#7BE581',
              600: '#59C469',
              700: '#3DA456',
              800: '#278445',
              900: '#176D3B',
              950: '#184f1d',
              DEFAULT: '#7BE581',
              foreground: '#184f1d',
            },
          },
        },
      },
    }),
    tailwindcssAnimate,
  ],
};
