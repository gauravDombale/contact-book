export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f0',
          100: '#d9d9d9',
          900: '#0f0f0f',
        },
        accent: '#2563eb',
      },
    },
  },
  plugins: [],
}
