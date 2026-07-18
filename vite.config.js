import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";

export default defineConfig({
  base: "/github-treasure-hunt/",
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: ["./index.html", "./src/**/*.{js,jsx}"],
        }),
      ],
    },
  },
  test: {
    environment: "node",
    includeSource: ["src/**/*.{js,jsx}"],
  },
});
