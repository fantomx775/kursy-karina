import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: [
      ".next/**",
      "out/**", 
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Add your custom rules here
    },
  },
]);

export default eslintConfig;
