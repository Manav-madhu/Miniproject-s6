export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px rgba(79, 70, 229, 0.35)'
      },
      colors: {
        legit: '#22c55e',
        fraud: '#ef4444',
        suspicious: '#f59e0b'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top, rgba(99,102,241,0.35), transparent 35%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.25), transparent 25%), linear-gradient(135deg, rgba(15,23,42,1), rgba(2,6,23,1))'
      }
    }
  },
  plugins: []
};
