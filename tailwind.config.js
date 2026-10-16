const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'login': "url('/img/background/bg-login.jpg')",
        'company-logo': "url('/img/logo_largo.png')",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        gabarito: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          dark: '#132640',
          baby: '#89CFF0',
          light: '#EBF5FB',
          gold: '#48A9E6', // Reemplazado por acento Baby Blue vibrante
        },
        surface: {
          900: '#132640',
          700: '#2A4365',
          400: '#7293B8',
          200: '#CFE2F3',
          app: '#F3F8FC', // Fondo ultra limpio Baby Blue soft
        },
        action: {
          DEFAULT: '#389CD6', // Baby Blue elegante
          700: '#2378AC',
          500: '#389CD6',
          400: '#68BBE8',
          200: '#BAE2F8',
        },
        accent: {
          DEFAULT: '#5B92E5',
          700: '#3A6EC1',
          500: '#5B92E5',
          400: '#8BB4F3',
          200: '#D5E4FC',
        },
        danger: {
          DEFAULT: '#E53E3E',
          700: '#C53030',
          500: '#E53E3E',
          600: '#C53030',
          200: '#FED7D7',
        },
        warning: {
          DEFAULT: '#DD6B20',
          700: '#C05621',
          500: '#DD6B20',
          400: '#ED8936',
          200: '#FEEBC8',
        },
        success: {
          DEFAULT: '#38A169',
          700: '#2F855A',
          500: '#38A169',
          400: '#48BB78',
          200: '#C6F6D5',
        },
        attention: {
          DEFAULT: '#48A9E6',
          700: '#2B82BD',
          500: '#48A9E6',
          400: '#76C2F0',
          200: '#C2E7FB',
        },
        neutral: {
          900: '#1A202C',
          700: '#4A5568',
          400: '#A0AEC0',
          200: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
});
