import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      signOptions: { 
        expiresIn: (process.env.JWT_EXPIRES_IN || '86400') as any
      },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, PrismaService, CloudinaryService],
})
export class ChatModule {}
