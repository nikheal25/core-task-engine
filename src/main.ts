import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'CoreTaskEngine',
      colors: true,
    }),
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Swagger setup
  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Core Task Engine API')
      .setDescription('Core Task Engine API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  if (swaggerEnabled) {
    console.log(
      `Swagger documentation is available at: ${await app.getUrl()}/api/docs`,
    );
  }
}
bootstrap().catch((err) => console.error('Bootstrap error:', err));
