# Linting and Code Formatting Setup

Your project now has ESLint and Prettier configured for code quality and consistency!

## ✅ What's Been Set Up

### 1. **ESLint** - Code Quality Linter

- Catches bugs and code quality issues
- Enforces React best practices
- React Hooks rules
- React Refresh rules for Vite

### 2. **Prettier** - Code Formatter

- Automatic code formatting
- Consistent code style across the project

### 3. **VS Code Integration**

- Auto-format on save
- Auto-fix ESLint issues on save
- Recommended extensions

## 📦 Installation

Run this command to install all linting dependencies (skip the postinstall scripts to avoid errors):

```bash
npm install --ignore-scripts
```

## 🚀 Available Commands

### Lint your code

```bash
npm run lint
```

### Auto-fix linting issues

```bash
npm run lint:fix
```

### Format code with Prettier

```bash
npm run format
```

## 📁 Configuration Files

- **`.eslintrc.cjs`** - ESLint configuration
- **`.prettierrc`** - Prettier configuration
- **`.eslintignore`** - Files ESLint should ignore
- **`.prettierignore`** - Files Prettier should ignore
- **`.vscode/settings.json`** - VS Code settings for auto-formatting
- **`.vscode/extensions.json`** - Recommended VS Code extensions

## 🔧 VS Code Extensions

The following extensions are recommended (VS Code will prompt you to install them):

1. **ESLint** (`dbaeumer.vscode-eslint`) - ESLint integration
2. **Prettier** (`esbenp.prettier-vscode`) - Prettier integration
3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Tailwind autocomplete

## 🎨 Prettier Rules

- **No semicolons** - Cleaner code
- **Single quotes** - For strings
- **2 spaces** - Indentation
- **Trailing commas** - ES5 style
- **100 character** - Max line width
- **Arrow parens** - Avoid when possible

## 🔍 ESLint Rules

- React best practices
- React Hooks rules
- No unused variables (warnings)
- Prop-types disabled (using TypeScript types instead)

## 🛠️ Troubleshooting

### Postinstall Script Error

If you see an error about `husky` during install:

```bash
npm install --ignore-scripts
```

### ESLint Not Working in VS Code

1. Reload VS Code window (Cmd+Shift+P → "Reload Window")
2. Make sure ESLint extension is installed
3. Check VS Code Output panel → ESLint for errors

### Prettier Not Formatting

1. Make sure Prettier is set as default formatter
2. Check "Format on Save" is enabled in settings
3. Right-click in file → "Format Document With..." → Choose Prettier

## ⚙️ Customization

### Modify ESLint Rules

Edit `.eslintrc.cjs` and add/modify rules:

```js
rules: {
  'rule-name': 'off', // Disable
  'rule-name': 'warn', // Warning
  'rule-name': 'error', // Error
}
```

### Modify Prettier Rules

Edit `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false
}
```

## 🎯 Best Practices

1. **Run linter before committing**

   ```bash
   npm run lint:fix
   ```

2. **Format code regularly**

   ```bash
   npm run format
   ```

3. **Enable format on save** in VS Code (already configured)

4. **Fix warnings** - Don't ignore linter warnings

## 📚 Learn More

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [React ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
