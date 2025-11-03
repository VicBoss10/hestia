import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:4200',
  });

  const config = new DocumentBuilder()
    .setTitle('Hestia - Gesture Control API')
    .setDescription('API for gesture recognition and statistics tracking')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addTag('stats', 'Gesture statistics endpoints')
    .addTag('gestures', 'Gesture management endpoints')
    .addTag('detections', 'Gesture detection endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
