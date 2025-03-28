# Commit Message Standards

This project enforces standardized commit messages using [Conventional Commits](https://www.conventionalcommits.org/). This document outlines our commit message format, provides examples, and explains how to use our commit validation tools.

## Commit Message Format

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

### Type

Must be one of the following:

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (formatting, etc) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding or correcting tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

### Scope

The scope should be the name of the npm package, module, or area of the codebase affected (e.g., `auth`, `api`, `logging`).

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

## Examples

```
feat(auth): add JWT authentication

Implement JWT-based authentication system with refresh tokens.

Closes #123
```

```
fix(api): resolve user data fetch issue

Fix timeout error when fetching user data from external service.
```

```
docs: update README with API documentation
```

```
refactor(core): simplify request processing pipeline

Replace multiple handlers with single middleware approach for better performance.
```

## Using Commit Validation Tools

### Standard Commit Flow

We use Husky and commitlint to validate commit messages. When you commit using standard Git commands, your commit message will be automatically validated:

```bash
git commit -m "feat(auth): add login functionality"
```

### Committing with Helper Script

For convenience, you can use our commit script which adds all changes and commits them:

```bash
pnpm commit
```

### Bypassing Validation (Emergency Only)

In urgent situations where you need to bypass validation:

```bash
pnpm commit:bypass
```

Or set the `HUSKY` environment variable to `0`:

```bash
HUSKY=0 git commit -m "your message"
```

> **Note:** Please use the bypass option sparingly. Even in urgent situations, try to follow the commit message convention as much as possible.

## Deployment Considerations

Husky hooks are automatically disabled in CI/CD environments and production deploys through our package.json configuration. 