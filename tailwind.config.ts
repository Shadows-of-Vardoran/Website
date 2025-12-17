import colors from 'tailwindcss/colors';

import { useColors } from './src/lib/useColors.ts';
const { generateBackgroundColors, generateColors } = useColors();

const pitchBlack = '#0D0D0D'; // almost black
const baseBackgroundColor = '#0D0D0D'; // dark gray

const basePrimaryColor = '#FF0000'; // bright red
const baseSecondaryColor = '#8B0000'; // dark red

const errorColor = '#CC4400'; // vibrant orange
const successColor = '#FFBF00'; // bright gold
const infoColor = '#4682B4 '; // steel blue

const textPrimaryColor = '#E8E8E8'; // light gray
const textSecondaryColor = '#9E9E9E '; // medium gray

const primaryOverlayOpacity = 0.8;
const secondaryOverlayOpacity = 0.3;
// 981c20 = red
/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    colors: {
      slate: colors.slate,
      red: colors.red,
      primary: generateColors(pitchBlack, basePrimaryColor, primaryOverlayOpacity),
      secondary: generateColors(pitchBlack, baseSecondaryColor, secondaryOverlayOpacity),
      background: generateBackgroundColors(baseBackgroundColor),

      error: generateColors(pitchBlack, errorColor, primaryOverlayOpacity),
      success: generateColors(pitchBlack, successColor, primaryOverlayOpacity),
      info: generateColors(pitchBlack, infoColor, secondaryOverlayOpacity),

      tprimary: generateColors(pitchBlack, textPrimaryColor, primaryOverlayOpacity),
      tsecondary: generateColors(pitchBlack, textSecondaryColor, primaryOverlayOpacity),

      zinc: colors.zinc,
      white: colors.white,
      black: colors.black,
      green: colors.green,
      orange: colors.orange,
      blue: colors.blue,
      sky: colors.sky,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      teal: colors.teal,
      yellow: colors.yellow,
    },
    extend: {
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        // ring: 'hsl(var(--ring) / <alpha-value>)',
        background: generateBackgroundColors(baseBackgroundColor),
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: generateColors(baseBackgroundColor, basePrimaryColor, primaryOverlayOpacity)[0],
          foreground: generateColors(baseBackgroundColor, basePrimaryColor, primaryOverlayOpacity),
          ...generateColors(baseBackgroundColor, basePrimaryColor, primaryOverlayOpacity),
        },
        secondary: {
          DEFAULT: generateColors(baseBackgroundColor, baseSecondaryColor, secondaryOverlayOpacity)[0],
          foreground: generateColors(baseBackgroundColor, baseSecondaryColor, secondaryOverlayOpacity),
          ...generateColors(baseBackgroundColor, baseSecondaryColor, secondaryOverlayOpacity),
        },

        error: {
          DEFAULT: generateColors(baseBackgroundColor, errorColor, primaryOverlayOpacity)[0],
          foreground: generateColors(baseBackgroundColor, errorColor, primaryOverlayOpacity),
          ...generateColors(baseBackgroundColor, errorColor, primaryOverlayOpacity),
        },
        success: {
          DEFAULT: generateColors(baseBackgroundColor, successColor, primaryOverlayOpacity)[0],
          foreground: generateColors(baseBackgroundColor, successColor, primaryOverlayOpacity),
          ...generateColors(baseBackgroundColor, successColor, primaryOverlayOpacity),
        },
        info: {
          DEFAULT: generateColors(baseBackgroundColor, infoColor, secondaryOverlayOpacity)[0],
          foreground: generateColors(baseBackgroundColor, infoColor, secondaryOverlayOpacity),
          ...generateColors(baseBackgroundColor, infoColor, secondaryOverlayOpacity),
        },

        tprimary: {
          DEFAULT: generateColors(baseBackgroundColor, textPrimaryColor, primaryOverlayOpacity)[0],
          foreground: generateColors(baseBackgroundColor, textPrimaryColor, primaryOverlayOpacity),
          ...generateColors(baseBackgroundColor, textPrimaryColor, primaryOverlayOpacity),
        },
        tsecondary: {
          DEFAULT: generateColors(baseBackgroundColor, textSecondaryColor, primaryOverlayOpacity)[0],
          foreground: generateColors(baseBackgroundColor, textSecondaryColor, primaryOverlayOpacity),
          ...generateColors(baseBackgroundColor, textSecondaryColor, primaryOverlayOpacity),
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  safelist: ['logo-button', 'dark', 'neutral', 'light', 'nav-button'],
  plugins: [
    function ({ addBase, theme }: any) {
      function extractColorVars(colorObj: any, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars: any = typeof value === 'string' ? { [`--color${colorGroup}-${colorKey}`]: value } : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    },
    function ({ addComponents, theme }: any) {
      const colors = theme('colors');
      const buttonClasses: Record<string, any> = {};

      Object.keys(colors).forEach((color) => {
        buttonClasses[`button.${color}`] = {
          color: `var(--color-${color}-500)`,
        };
        buttonClasses[`button.${color}:hover`] = {
          color: `var(--color-background-900)`,
          backgroundColor: `var(--color-${color}-500)`,
        };
      });

      addComponents(buttonClasses);
    },
    function ({ addVariant }) {
      addVariant('max-md', '@media (max-width: 768px)');
    },
  ],
};

export default config;
