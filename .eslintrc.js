module.exports = {
  root: true,
  extends: ["universe/native", "universe/shared/typescript-analysis", "prettier"],
  plugins: ["react", "react-native", "@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": "off",
    "object-curly-newline": "off",
    "import/order": "off",
    "sort-imports": "off",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.d.ts"],
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: process.cwd(),
      },
      rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "react/react-in-jsx-scope": "off",
        "react-native/no-inline-styles": "warn",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
      },
    },
  ],
};
