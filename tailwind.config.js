/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.tsx"],
  theme: {
    extend: {
      screens: {
        mobile: { min: "320px", max: "480px" },
        // => @media (min-width: 320px and max-width: 480px) { ... }

        tablet: { min: "481px", max: "768px" },
        // => @media (min-width: 481px and max-width: 768px) { ... }

        laptops: { min: "769px", max: "1023px" },
        // => @media (min-width: 769px and max-width: 1023px) { ... }

        desktop: { min: "1024px", max: "1200px" },
        // => @media (min-width: 1024px and max-width: 1200px) { ... }

        tv: { min: "1201px" },
        // => @media (min-width: 1201px) { ... }
      },
    },
  },
  plugins: [],
};
