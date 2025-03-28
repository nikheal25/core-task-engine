# Coding Standards

This document outlines the coding standards and conventions used in the Core Task Engine project.

## General Principles

- Use English for all code and documentation
- Follow the [NestJS best practices](https://docs.nestjs.com/first-steps)
- Write clean, self-documenting code
- Follow SOLID principles
- Prefer composition over inheritance

## TypeScript Guidelines

### Type Safety

- Always declare the type of each variable and function (parameters and return value)
- Avoid using `any` type; use `unknown` if the type is truly not known
- Create necessary types and interfaces to ensure type safety
- Use type inference when the type is obvious
- Use generics for reusable components

### Naming Conventions

- Use **PascalCase** for:
  - Classes
  - Interfaces
  - Types
  - Enums
  - Decorators

- Use **camelCase** for:
  - Variables
  - Functions
  - Methods
  - Properties
  - Parameters

- Use **kebab-case** for:
  - File names
  - Directory names

- Use **UPPERCASE** for:
  - Constants
  - Environment variables

### File and Folder Structure

- One export per file (with few exceptions)
- Follow the NestJS module structure:
  ```
  ├── module/
  │   ├── dto/                # Data Transfer Objects
  │   ├── entities/           # Database entities
  │   ├── interfaces/         # Interfaces and types
  │   ├── module.controller.ts # Controller
  │   ├── module.service.ts   # Service
  │   ├── module.module.ts    # Module declaration
  │   └── module.spec.ts      # Tests
  ```

## Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Maximum line length: 100 characters
- Use trailing commas in multi-line object literals
- Use parentheses around arrow function parameters, even when there's only one parameter

## Functions

- Write short functions with a single purpose (less than 20 lines)
- Name functions with a verb and something else
- If a function returns a boolean, use `isX`, `hasX`, or `canX` naming pattern
- If a function doesn't return anything, use `performX`, `executeX`, or `saveX` naming pattern
- Use early returns instead of nested conditionals
- Avoid nesting blocks by extracting to utility functions
- Use higher-order functions (map, filter, reduce) to avoid function nesting

## Classes

- Follow SOLID principles
- Keep classes small and focused (less than 200 lines)
- Limit methods to less than 10 public methods
- Use dependency injection for service dependencies
- Document public methods with JSDoc comments

## Documentation

- Use JSDoc comments for public classes and methods
- Keep comments up to date with code changes
- Document edge cases and complex logic
- For complex code blocks, explain the "why" not the "what"

## Testing

- Write unit tests for all services and controllers
- Follow the AAA (Arrange-Act-Assert) pattern
- Use descriptive test names: "should [expected behavior] when [condition]"
- Mock external dependencies in unit tests
- Use test doubles (mocks, stubs, spies) appropriately
- Write end-to-end tests for critical paths

## Error Handling

- Use exception filters for global error handling
- Create custom exceptions for domain-specific errors
- Handle all errors gracefully with appropriate status codes
- Log errors at the appropriate level (debug, info, warn, error)
- Avoid catching errors and then re-throwing them without adding context

## Code Quality Tools

This project uses the following tools for code quality:

- ESLint for static code analysis
- Prettier for code formatting
- Jest for testing
- TypeScript compiler options for type checking

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard with enforced validation via Husky and commitlint. See our detailed [commit standards documentation](./commit-standards.md) for the complete guide.

Basic format:
```
type(scope): subject
```

Common types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Maintenance tasks 