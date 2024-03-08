/** @type {import('tailwindcss').Config} */

const { nextui } = require('@nextui-org/theme');
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '3.2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      lineHeight: {
        3: '1.2rem',
        4: '1.6rem',
        5: '2.0rem',
        6: '2.4rem',
        7: '2.8rem',
        8: '3.2rem',
        9: '3.6rem',
        10: '4.0rem',
      },
      fontSize: {
        xs: ['1.2rem', { lineHeight: '1.6rem' }],
        sm: ['1.4rem', { lineHeight: '2.0rem' }],
        base: ['1.6rem', { lineHeight: '2.4rem' }],
        lg: ['1.8rem', { lineHeight: '2.8rem' }],
        xl: ['2.0rem', { lineHeight: '2.8rem' }],
        '2xl': ['2.4rem', { lineHeight: '3.2rem' }],
        '3xl': ['3.0rem', { lineHeight: '3.6rem' }],
        '4xl': ['3.6rem', { lineHeight: '4.0rem' }],
        '5xl': ['4.8rem', { lineHeight: '1' }],
        '6xl': ['6.0rem', { lineHeight: '1' }],
        '7xl': ['7.2rem', { lineHeight: '1' }],
        '8xl': ['9.6rem', { lineHeight: '1' }],
        '9xl': ['12.8rem', { lineHeight: '1' }],
      },
      spacing: {
        px: '.1rem',
        0.5: '.2rem',
        1: '.4rem',
        1.5: '.6rem',
        2: '.8rem',
        2.5: '1.0rem',
        3: '1.2rem',
        3.5: '1.4rem',
        4: '1.6rem',
        5: '2.0rem',
        6: '2.4rem',
        7: '2.8rem',
        8: '3.2rem',
        9: '3.6rem',
        10: '4.0rem',
        11: '4.4rem',
        12: '4.8rem',
        13.5: '5.4rem',
        14: '5.6rem',
        16: '6.4rem',
        20: '8.0rem',
        24: '9.6rem',
        28: '11.2rem',
        32: '12.8rem',
        36: '14.4rem',
        40: '16.0rem',
        44: '17.6rem',
        48: '19.2rem',
        52: '20.8rem',
        56: '22.4rem',
        60: '24.0rem',
        64: '25.6rem',
        72: '28.8rem',
        80: '32.0rem',
        96: '38.4rem',
        34: '8.5rem',
        68: '27.2rem',
        82.5: '33.0rem',
        90: '36.0rem',
        100: '40.0rem',
        106: '42.4rem',
        200: '80.0rem',
      },
      borderRadius: {
        sm: '.2rem',
        DEFAULT: '.4rem',
        md: '.6rem',
        lg: '.8rem',
        xl: '1.2rem',
        '2xl': '1.6rem',
        '3xl': '2.4rem',
      },
      minWidth: (theme) => ({
        ...theme('spacing'),
      }),
      maxWidth: (theme) => ({
        ...theme('spacing'),
        0: '0rem',
        xs: '32.0rem',
        sm: '38.4rem',
        md: '44.8rem',
        lg: '51.2rem',
        xl: '57.6rem',
        '2xl': '67.2rem',
        '3xl': '76.8rem',
        '4xl': '89.6rem',
        '5xl': '102.4rem',
        '6xl': '115.2rem',
        '7xl': '128.0rem',
      }),
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    'tailwindcss-animate',
    nextui({
      layout: {
        spacingUnit: 6.4, // in px
        disabledOpacity: 0.5, // this value is applied as opacity-[value] when the component is disabled
        dividerWeight: '1.6px', // h-divider the default height applied to the divider component
        fontSize: {
          tiny: '1.2rem', // text-tiny
          small: '1.4rem', // text-small
          medium: '1.6rem', // text-medium
          large: '1.8rem', // text-large
        },
        lineHeight: {
          tiny: '1.6rem', // text-tiny
          small: '2rem', // text-small
          medium: '2.4rem', // text-medium
          large: '2.8rem', // text-large
        },
        radius: {
          small: '12.8px', // rounded-small
          medium: '19.2px', // rounded-medium
          large: '22.4px', // rounded-large
        },
        borderWidth: {
          small: '1.6px', // border-small
          medium: '3.2px', // border-medium (default)
          large: '4.8px', // border-large
        },
      },
      themes: {
        light: {
          layout: {
            hoverOpacity: 0.8, //  this value is applied as opacity-[value] when the component is hovered
            boxShadow: {
              // shadow-small
              small:
                '0px 0px 5px 0px rgb(0 0 0 / 0.02), 0px 2px 10px 0px rgb(0 0 0 / 0.06), 0px 0px 1px 0px rgb(0 0 0 / 0.3)',
              // shadow-medium
              medium:
                '0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)',
              // shadow-large
              large:
                '0px 0px 30px 0px rgb(0 0 0 / 0.04), 0px 30px 60px 0px rgb(0 0 0 / 0.12), 0px 0px 1px 0px rgb(0 0 0 / 0.3)',
            },
          },
        },
        dark: {
          layout: {
            hoverOpacity: 0.9, //  this value is applied as opacity-[value] when the component is hovered
            boxShadow: {
              // shadow-small
              small:
                '0px 0px 5px 0px rgb(0 0 0 / 0.05), 0px 2px 10px 0px rgb(0 0 0 / 0.2), inset 0px 0px 1px 0px rgb(255 255 255 / 0.15)',
              // shadow-medium
              medium:
                '0px 0px 15px 0px rgb(0 0 0 / 0.06), 0px 2px 30px 0px rgb(0 0 0 / 0.22), inset 0px 0px 1px 0px rgb(255 255 255 / 0.15)',
              // shadow-large
              large:
                '0px 0px 30px 0px rgb(0 0 0 / 0.07), 0px 30px 60px 0px rgb(0 0 0 / 0.26), inset 0px 0px 1px 0px rgb(255 255 255 / 0.15)',
            },
          },
        },
      },
    }),
  ],
  darkMode: 'class',
  corePlugins: {
    preflight: true,
  },
};
