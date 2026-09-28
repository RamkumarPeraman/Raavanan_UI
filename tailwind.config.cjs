module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#effaf8',
          100: '#d7f3ef',
          200: '#b2e7de',
          300: '#7ad5c9',
          400: '#43b8ad',
          500: '#259a92',
          600: '#1b7b77',
          700: '#176261',
          800: '#164e4e',
          900: '#153f40',
          950: '#082628',
        },
        accent: {
          50: '#fff8eb',
          100: '#ffedc8',
          200: '#ffd88a',
          300: '#ffc04d',
          400: '#ffab22',
          500: '#f28b07',
          600: '#d16a02',
          700: '#aa4d06',
          800: '#8a3d0d',
          900: '#71330f',
        },
        ink: {
          50: '#f6f8fa',
          100: '#edf1f5',
          200: '#d6dee8',
          300: '#b2c1d1',
          400: '#889db4',
          500: '#687f96',
          600: '#52677b',
          700: '#435362',
          800: '#394652',
          900: '#2a333d',
          950: '#141a20',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Segoe UI"', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
