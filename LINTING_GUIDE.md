# Linting & Code Quality Guide

## Overview

This project uses a comprehensive linting and formatting setup to ensure consistent code quality across JavaScript, TypeScript, JSX, and TSX files.

## Tools & Configuration

### 1. ESLint

**Purpose:** Static code analysis to find and fix problems in JavaScript/TypeScript code.

**Configuration File:** `.eslintrc.cjs`

**Key Features:**

- ✅ JavaScript (ES2020+)
- ✅ TypeScript support
- ✅ React & JSX/TSX
- ✅ React Hooks rules
- ✅ Custom rules for code quality

**Extends:**

- `eslint:recommended` - Core ESLint rules
- `plugin:react/recommended` - React-specific rules
- `plugin:react/jsx-runtime` - New JSX transform support
- `plugin:react-hooks/recommended` - React Hooks best practices
- `plugin:@typescript-eslint/recommended` - TypeScript rules
- `prettier` - Disables conflicting ESLint formatting rules

### 2. Prettier

**Purpose:** Opinionated code formatter for consistent styling.

**Configuration File:** `.prettierrc`

**Settings:**

```json
{
  "semi": false, // No semicolons
  "singleQuote": true, // Single quotes for strings
  "tabWidth": 2, // 2 spaces for indentation
  "trailingComma": "es5", // Trailing commas where valid in ES5
  "printWidth": 100, // Line length limit
  "arrowParens": "avoid", // Omit parens when possible
  "endOfLine": "lf" // Unix line endings
}
```

### 3. TypeScript

**Purpose:** Type checking for TypeScript files.

**Configuration Files:**

- `tsconfig.json` - Main TypeScript config
- `tsconfig.node.json` - Config for Node.js files

**Key Settings:**

- Target: ES2020
- Strict mode enabled
- JSX: react-jsx (new transform)
- Module: ESNext
- Path aliases: `@/*` → `./src/*`

### 4. EditorConfig

**Purpose:** Maintain consistent coding styles across different editors and IDEs.

**Configuration File:** `.editorconfig`

**Settings:**

- UTF-8 charset
- LF line endings
- 2-space indentation
- Trim trailing whitespace
- Insert final newline

## Available Scripts

### Linting

```bash
# Run ESLint on all files
npm run lint

# Fix auto-fixable ESLint issues
npm run lint:fix
```

### Formatting

```bash
# Format all files with Prettier
npm run format

# Check if files are formatted correctly
npm run format:check
```

### Type Checking

```bash
# Run TypeScript type checking (no emit)
npm run type-check
```

### Combined Check (Recommended for CI)

```bash
# Run all checks before committing
npm run lint && npm run format:check && npm run type-check
```

## File Coverage

### Linted Files

- `*.js` - JavaScript files
- `*.jsx` - React JSX files
- `*.ts` - TypeScript files
- `*.tsx` - React TSX files

### Formatted Files

- `*.js`, `*.jsx`, `*.ts`, `*.tsx` - JavaScript/TypeScript
- `*.json` - JSON files
- `*.css` - CSS files
- `*.md` - Markdown files

### Ignored Files (`.eslintignore` & `.prettierignore`)

- `node_modules/` - Dependencies
- `dist/`, `build/` - Build output
- `*.log` - Log files
- `.env*` - Environment files
- `.DS_Store` - macOS system files
- `.vscode/`, `.idea/` - IDE config
- `package-lock.json` - Lock files

## ESLint Rules

### React Rules

- ✅ `react/prop-types: off` - PropTypes disabled (using TypeScript)
- ✅ `react-refresh/only-export-components` - Warn on mixed exports

### TypeScript Rules

- ✅ `@typescript-eslint/no-unused-vars: warn` - Warn on unused variables
- ✅ `@typescript-eslint/no-explicit-any: warn` - Warn on `any` type
- ✅ `@typescript-eslint/no-non-null-assertion: warn` - Warn on `!` assertions

### General Rules

- ✅ `no-console: warn` - Warn on console (except warn/error)
- ✅ `prefer-const: warn` - Prefer const over let
- ✅ `no-var: error` - Disallow var (use let/const)

### Special Overrides

**JavaScript files** (`*.js`, `*.jsx`):

- Allow `require()` statements

**Config files** (`*.config.js`, `server*.js`):

- Allow console statements
- Allow `require()` statements

## IDE Integration

### VS Code

Install extensions:

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **EditorConfig** - `editorconfig.editorconfig`

**Settings (`.vscode/settings.json`):**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

### WebStorm / IntelliJ IDEA

1. Go to **Preferences** → **Languages & Frameworks**
2. Enable **ESLint** with automatic configuration
3. Enable **Prettier** and set as default formatter
4. Enable **EditorConfig** support

## Pre-commit Hooks (Optional)

Consider adding pre-commit hooks with `husky` and `lint-staged`:

```bash
npm install --save-dev husky lint-staged
```

**`.husky/pre-commit`:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**`package.json`:**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Lint & Type Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run type-check
```

## Common Issues & Solutions

### Issue: ESLint errors in TypeScript files

**Solution:** Make sure TypeScript ESLint packages are installed:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Issue: Prettier conflicts with ESLint

**Solution:** Ensure `eslint-config-prettier` is the last item in ESLint extends array.

### Issue: Different line endings (CRLF vs LF)

**Solution:** EditorConfig and Prettier both enforce LF. Run:

```bash
npm run format
```

### Issue: Import errors in TypeScript

**Solution:** Check `tsconfig.json` paths and install types:

```bash
npm install --save-dev @types/node
```

## Best Practices

1. **Run linting before committing**

   ```bash
   npm run lint && npm run format:check
   ```

2. **Fix issues automatically when possible**

   ```bash
   npm run lint:fix && npm run format
   ```

3. **Check types regularly**

   ```bash
   npm run type-check
   ```

4. **Use consistent imports**
   - Prefer named exports
   - Use path aliases: `@/components/Button`
   - Group imports: external → internal → relative

5. **Follow React best practices**
   - Use functional components with hooks
   - Extract custom hooks for logic
   - Keep components small and focused

6. **TypeScript tips**
   - Avoid `any` type
   - Use interfaces for object shapes
   - Leverage type inference
   - Don't use `!` non-null assertions unless necessary

## Migration from Old Setup

If migrating from an old linting setup:

1. **Install new dependencies:**

   ```bash
   npm install
   ```

2. **Fix all auto-fixable issues:**

   ```bash
   npm run lint:fix
   npm run format
   ```

3. **Review and fix remaining issues:**

   ```bash
   npm run lint
   ```

4. **Test the build:**
   ```bash
   npm run build
   ```

## Summary

✅ **Unified configuration** for JS, JSX, TS, and TSX  
✅ **Consistent formatting** with Prettier  
✅ **Type safety** with TypeScript  
✅ **React best practices** enforced  
✅ **Editor integration** via EditorConfig  
✅ **CI/CD ready** with npm scripts

The linting setup is now fully unified and production-ready!
