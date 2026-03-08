import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TransportsController } from './transports.controller';

@Module({
  controllers: [TransportsController],
  providers: [PrismaService],
})
export class TransportsModule {}
