// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";
;


export default tseslint.config(
  defineConfig([globalIgnores(["**/dist/", "**/node_modules/", "**/*.config.js"])]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
);