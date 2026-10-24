import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

const generated = [
  { auto: true },
  "!.svelte-kit/**",
  "!.svelte-kit",
  "!build/**",
  "!build",
  "!node_modules/.vite/**",
];

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  run: {
    tasks: {
      dev: { command: "bun --bun vp dev", cache: false, dependsOn: ["migrate"] },
      build: { command: "bun --bun vp build", cache: { input: generated } },
      start: { command: "bun ./build/index.js", cache: false, dependsOn: ["build"] },
      test: { command: "bun --bun vp test run", cache: { input: generated } },
      check: {
        command:
          "svelte-kit sync && vp check && svelte-check --tsgo --fail-on-warnings --tsconfig ./tsconfig.json",
        cache: { input: generated },
      },
      fix: { command: "vp check --fix", cache: false },
      migrate: { command: "bunx --bun prisma db migrate", cache: false },
    },
  },
  fmt: {
    printWidth: 100,
    sortImports: true,
    sortTailwindcss: { stylesheet: "./src/app.css" },
    svelte: true,
    ignorePatterns: [
      "build/**",
      ".svelte-kit/**",
      ".claude/skills/prisma-8/**",
      "prisma/contract.*",
      "prisma/migrations/**",
    ],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "import", "vitest", "promise"],
    categories: {
      correctness: "error",
      pedantic: "error",
      suspicious: "error",
      perf: "error",
      style: "error",
    },
    rules: {
      "typescript/prefer-readonly-parameter-types": "off",
      "typescript/consistent-return": "off",
      "oxc/no-map-spread": "off",
      "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
      "eslint/one-var": ["error", "never"],
      "eslint/no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
      "eslint/curly": ["error", "multi-line"],
      "typescript/consistent-type-definitions": ["error", "type"],
      "unicorn/filename-case": ["error", { cases: { camelCase: true, pascalCase: true } }],
      "vitest/consistent-test-it": ["error", { fn: "test", withinDescribe: "test" }],
      "eslint/func-style": "off",
      "eslint/id-length": "off",
      "eslint/init-declarations": "off",
      "eslint/max-params": "off",
      "eslint/max-statements": "off",
      "eslint/no-magic-numbers": "off",
      "eslint/no-ternary": "off",
      "eslint/sort-imports": "off",
      "eslint/sort-keys": "off",
      "import/exports-last": "off",
      "import/group-exports": "off",
      "import/no-named-export": "off",
      "import/no-namespace": "off",
      "import/no-nodejs-modules": "off",
      "import/prefer-default-export": "off",
      "unicorn/max-nested-calls": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/no-null": "off",
      "vitest/max-expects": "off",
      "vitest/no-hooks": "off",
      "vitest/no-importing-vitest-globals": "off",
      "vitest/prefer-importing-vitest-globals": "off",
      "vitest/prefer-describe-function-title": "off",
      "vitest/prefer-expect-assertions": "off",
      "vitest/prefer-expect-resolves": "off",
      "vitest/prefer-to-be-falsy": "off",
      "vitest/prefer-to-be-truthy": "off",
      "vitest/require-hook": "off",
    },
    overrides: [
      {
        files: ["**/*.test.ts"],
        rules: {
          "eslint/max-lines-per-function": "off",
          "eslint/no-await-in-loop": "off",
          "typescript/no-unsafe-type-assertion": "off",
          "vitest/no-standalone-expect": [
            "error",
            { additionalTestBlockFunctions: ["test", "test.for"] },
          ],
        },
      },
      {
        files: ["src/app.d.ts"],
        rules: { "typescript/consistent-type-definitions": "off" },
      },
      {
        files: ["src/lib/server/testing.ts"],
        rules: { "import/max-dependencies": "off" },
      },
      {
        files: ["**/*.svelte", "src/routes/**/+page.server.ts"],
        rules: { "import/max-dependencies": ["error", { max: 20 }] },
      },
    ],
    ignorePatterns: [
      "build/**",
      ".svelte-kit/**",
      ".claude/skills/prisma-8/**",
      "prisma/contract.*",
      "prisma/migrations/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
      denyWarnings: true,
      reportUnusedDisableDirectives: "error",
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
