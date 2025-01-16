/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#f57c00", // Replace with the exact hex code for your button color
        secondary: "#f3f4f6", // Replace with the previous light background
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
