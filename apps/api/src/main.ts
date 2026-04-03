import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) {
    return configuredOrigins;
  }

  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nhutthanh.id.vn',
    'https://www.nhutthanh.id.vn',
    'https://api.nhutthanh.id.vn',
    'https://ai.nhutthanh.id.vn',
  ];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cấu hình phục vụ file tĩnh từ thư mục uploads (dùng process.cwd để chắc chắn)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Kích hoạt Validation tự động dựa trên DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  // Cấu hình CORS cho cả Localhost và Production
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });

  const port = Number(process.env.PORT || 4000);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`API listening on http://${host}:${port} (CORS + Validation ON)`);
}
bootstrap();
