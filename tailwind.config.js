/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bidflow: {
          DEFAULT: "#08305e",
          light: "#fffce8",
        },
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
