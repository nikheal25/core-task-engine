# Linting and Formatting Guide

This document outlines the code linting and formatting standards used in the Core Task Engine project.

## Tools

We use the following tools to maintain code quality and consistency:

-   **ESLint**: For identifying and reporting on patterns found in ECMAScript/JavaScript code, with support for TypeScript.
-   **Prettier**: An opinionated code formatter that enforces a consistent style.

## Standards

-   **ESLint**: We adhere to the **Airbnb JavaScript Style Guide** (`eslint-config-airbnb-base`) adapted for TypeScript (`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`).
-   **Prettier**: We use the default Prettier rules along with specific settings defined in `.prettierrc.json` (e.g., single quotes, trailing commas).

ESLint and Prettier configurations are integrated (`eslint-config-prettier`, `eslint-plugin-prettier`) to prevent conflicts between linting rules and formatting rules.

## Configuration Files

-   `.eslintrc.json`: Configures ESLint, including extends, plugins, rules, and ignored patterns.
-   `.prettierrc.json`: Configures Prettier formatting options.

## Usage

Scripts are available in `package.json` to run these tools:

-   **Formatting**: To automatically format all relevant files according to Prettier rules:
    ```bash
    pnpm format
    ```
-   **Linting**: To check the code for style and potential errors according to ESLint rules, and automatically fix fixable issues:
    ```bash
    pnpm lint
    ```

## Best Practices

-   **Run Format and Lint Before Committing**: Ensure your code is formatted and passes lint checks before committing your changes. Consider integrating this into pre-commit hooks (e.g., using Husky, which seems to be partially set up).
-   **IDE Integration**: Configure your IDE (e.g., VS Code) to use ESLint and Prettier for real-time feedback and auto-formatting on save. This significantly improves the development workflow.
-   **Address Lint Warnings**: While errors must be fixed, pay attention to warnings (`warn`) reported by ESLint, as they often highlight potential issues or areas for improvement. 