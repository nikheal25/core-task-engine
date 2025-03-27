# Getting Started

This guide will help you get the Core Task Engine project up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (optional, for containerized development)
- [Git](https://git-scm.com/)

## Clone the Repository

```bash
git clone <repository-url>
cd core-task-engine
```

## Install Dependencies

```bash
pnpm install
```

## Environment Setup

The project uses different environment configurations. For local development:

1. Copy the environment template:
   ```bash
   cp .env.development .env.local
   ```

2. Modify `.env.local` with your own settings if needed.

## Running the Application

### Development Mode

```bash
# Start in development mode with auto-reload
pnpm run start:dev
```

### Production Build

```bash
# Build the application
pnpm run build

# Start the production server
pnpm run start:prod
```

### Using Docker

```bash
# Development environment
./docker-deploy.sh development

# Production environment
./docker-deploy.sh production
```

## Verifying the Setup

Once the application is running, you can verify it by:

1. Opening the API at [http://localhost:3000](http://localhost:3000)
2. Checking the health endpoint at [http://localhost:3000/health](http://localhost:3000/health)
3. Accessing the Swagger documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Next Steps

- Read the [Coding Standards](./coding-standards.md) to understand the project conventions
- Explore the [API Documentation](../api-documentation/README.md) to understand the business logic
- Set up your IDE with the recommended extensions (see below)

## Recommended IDE Setup

For optimal development experience, we recommend using:

- [Visual Studio Code](https://code.visualstudio.com/)
- Extensions:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [NestJS Snippets](https://marketplace.visualstudio.com/items?itemName=ashinzekene.nestjs)
  - [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) 