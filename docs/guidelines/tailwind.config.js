/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        eleos: {
          amber: '#D88100',
          gold: '#FFBD00',
          butter: '#FFF1D0',
          sun: '#FFD900',
          ink: '#293D86',
          blueberry: '#526DAA',
          sky: '#D5ECFC',
          cornflower: '#3A82DD',
          pine: '#3F8A89',
          tiel: '#80C7C7',
          mist: '#DCF6F0',
          blush: '#FF8D9F',
          petal: '#FFEDEA',
          slate: '#204457',
          midnight: '#172C37',
          fog: '#A7BECA',
          paper: '#FAF7F1',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        serif: ['Source Serif 4', 'Source Serif Pro', 'Georgia', 'serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': '11px',
        'xs': '12px',
        'sm': '13px',
        'base': '14px',
        'lg': '15px',
        'xl': '18px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '34px',
        '5xl': '36px',
        '6xl': '42px',
        '7xl': '72px',
      },
      boxShadow: {
        card: '0 2px 0 0 #293D86',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
        48: '48px',
        56: '56px',
        64: '64px',
        96: '96px',
      },
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(.2,.7,.2,1)',
      },
    },
  },
  plugins: [],
}
