import { writeFileSync, existsSync } from 'fs';

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`;

const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

if (!existsSync('./tailwind.config.js')) {
  writeFileSync('./tailwind.config.js', tailwindConfig);
  console.log("✅ tailwind.config.js created");
}

if (!existsSync('./postcss.config.js')) {
  writeFileSync('./postcss.config.js', postcssConfig);
  console.log("✅ postcss.config.js created");
}
