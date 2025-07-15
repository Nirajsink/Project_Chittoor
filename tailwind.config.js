// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configure dark mode to use the 'data-theme="dark"' attribute on the HTML element
  // This tells Tailwind to generate dark mode variants (e.g., dark:bg-primary)
  darkMode: ['class', '[data-theme="dark"]'],

  // Specify files where Tailwind should look for classes to include in the build.
  // This is crucial for Tailwind's purging mechanism and for it to recognize classes.
  // Ensure these paths accurately reflect where your components and pages are located.
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // For pages in the old 'pages' directory
    './app/**/*.{js,ts,jsx,tsx,mdx}',    // For pages and components in the new 'app' directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // For components in a top-level 'components' directory
    // If you have a 'src' directory, you might need to add:
    // './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Map your custom CSS variables to Tailwind's semantic color names
      // This allows you to use classes like `bg-primary`, `text-secondary`, `border-border`
      // and have them resolve to the values defined in your CSS variables in globals.css.
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--bg-primary)', // Maps Tailwind's 'primary' to your CSS var --bg-primary
        secondary: 'var(--bg-secondary)', // Maps Tailwind's 'secondary' to your CSS var --bg-secondary
        accent: 'var(--bg-accent)',
        'text-primary': 'var(--text-primary)', // Explicitly map text colors
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border-color)', // Maps Tailwind's 'border' to your CSS var --border-color

        // Map specific color shades to CSS variables for dynamic usage
        // This allows you to use classes like `bg-blue-100`, `text-green-600`
        // and have them resolve to your CSS variables defined in globals.css.
        blue: {
          50: 'var(--blue-50)',
          100: 'var(--blue-100)',
          600: 'var(--blue-600)',
          700: 'var(--blue-700)',
        },
        green: {
          50: 'var(--green-50)',
          100: 'var(--green-100)',
          600: 'var(--green-600)',
          700: 'var(--green-700)',
        },
        purple: {
          50: 'var(--purple-50)',
          100: 'var(--purple-100)',
          600: 'var(--purple-600)',
          700: 'var(--purple-700)',
        },
        red: {
          600: 'var(--red-600)',
          700: 'var(--red-700)',
        },
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
      },
    },
  },
  plugins: [],
};
