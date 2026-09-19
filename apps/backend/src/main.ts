import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - acepta localhost, la URL de producción y cualquier preview de Vercel
  const allowedOrigins: string[] = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL ?? '',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir requests sin origen (Postman, curl, etc.)
      if (!origin) return callback(null, true);
      // Permitir cualquier subdominio de vercel.app
      if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS bloqueado para origen: ${origin}`), false);
    },
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Documentación Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('NovaERP API')
    .setDescription('API REST del sistema ERP Fiscal Venezolano NovaERP')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Autenticación')
    .addTag('Parametrización Fiscal')
    .addTag('Contabilidad')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 NovaERP Backend corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
