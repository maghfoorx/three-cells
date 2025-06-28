/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff", // oklch(1 0 0)
        foreground: "#595958", // oklch(0.34 0.01 7.89)
        card: "#ffffff", // oklch(1 0 0)
        "card-foreground": "#595958", // oklch(0.34 0.01 7.89)
        popover: "#ffffff", // oklch(1 0 0)
        "popover-foreground": "#595958", // oklch(0.34 0.01 7.89)
        primary: "#e96a3d", // oklch(0.74 0.16 34.57)
        "primary-foreground": "#ffffff", // oklch(1 0 0)
        secondary: "#f7e9db", // oklch(0.96 0.02 28.97)
        "secondary-foreground": "#b56f46", // oklch(0.56 0.13 32.65)
        muted: "#f8edfa", // oklch(0.97 0.02 44.86)
        "muted-foreground": "#886b61", // oklch(0.49 0.05 27.86)
        accent: "#db93e5", // oklch(0.83 0.11 57.89)
        "accent-foreground": "#595958", // oklch(0.34 0.01 7.89)
        destructive: "#b94f48", // oklch(0.61 0.21 22.21)
      },
    },
  },
  plugins: [],
};
