import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

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
    origin: [
      'http://localhost:3000',
      'https://nhutthanh.id.vn',
      'https://www.nhutthanh.id.vn',
      'https://api.nhutthanh.id.vn',
      'https://ai.nhutthanh.id.vn',
    ],
    credentials: true,
  });

  await app.listen(4000);
  console.log('API listening on http://localhost:4000 (CORS + Validation ON)');
}
bootstrap();
