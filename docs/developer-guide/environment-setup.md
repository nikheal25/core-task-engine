# Environment Setup

This guide explains how to configure the different environments for the Core Task Engine project.

## Environment Overview

The project supports the following environments:

- **Local**: For development on your local machine without Docker
- **Development**: For development with Docker
- **Staging**: For testing in a staging environment
- **Production**: For production deployment

## Environment Configuration Files

Each environment has its own configuration file:

- `.env.local`: Local development
- `.env.development`: Docker development
- `.env.staging`: Staging environment
- `.env.production`: Production environment

## Configuration Variables

Here are the important configuration variables used in the project:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port on which the application runs | `3000` |
| `NODE_ENV` | Node environment (development/staging/production) | `development` |
| `SWAGGER_ENABLED` | Whether Swagger UI is enabled | `true` (except in production) |

## Setting Up Environment Files

### Local Development

1. Create a `.env.local` file in the project root:
   ```env
   PORT=3000
   NODE_ENV=local
   SWAGGER_ENABLED=true
   ```

2. Start the application:
   ```bash
   export NODE_ENV=local
   pnpm run start:dev
   ```

### Docker Development

1. Create a `.env.development` file in the project root:
   ```env
   PORT=3000
   NODE_ENV=development
   SWAGGER_ENABLED=true
   ```

2. Start with Docker:
   ```bash
   ./docker-deploy.sh development
   ```

### Staging Environment

1. Create a `.env.staging` file in the project root:
   ```env
   PORT=3000
   NODE_ENV=staging
   SWAGGER_ENABLED=true
   ```

2. Start with Docker:
   ```bash
   ./docker-deploy.sh staging
   ```

### Production Environment

1. Create a `.env.production` file in the project root:
   ```env
   PORT=3000
   NODE_ENV=production
   SWAGGER_ENABLED=false
   ```

2. Start with Docker:
   ```bash
   ./docker-deploy.sh production
   ```

## Environment Variables in Code

The application uses the `@nestjs/config` package to manage environment variables. You can access environment variables in your code like this:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YourService {
  constructor(private configService: ConfigService) {}

  someMethod() {
    // Get an environment variable with a default value
    const port = this.configService.get<number>('PORT', 3000);
    
    // Get a required environment variable (will throw if not present)
    const apiKey = this.configService.getOrThrow<string>('API_KEY');
  }
}
```

## Loading Environment Files

The application automatically loads the appropriate environment file based on the `NODE_ENV` environment variable. This is configured in the `src/config/config.module.ts` file:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
```

## Environment-Specific Configuration

If you need to apply environment-specific configuration to your application, you can use the `ConfigService` or conditionally load modules based on the environment.

### Example: Conditional Module Loading

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevToolsModule } from './dev-tools/dev-tools.module';

@Module({
  imports: [
    ConfigModule,
    // Conditionally load a module based on environment
    {
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get('NODE_ENV') !== 'production';
        return isDevelopment ? DevToolsModule : [];
      },
    },
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Environment Variables in Docker

When running the application with Docker, environment variables are passed to the container through:

1. The `.env.*` file specified in the `docker-compose.yml` file
2. The `environment` section in the docker-compose file

Environment variables specified in the docker-compose file override those in the .env file. 