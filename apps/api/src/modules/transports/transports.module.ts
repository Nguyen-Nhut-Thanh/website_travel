import { Module } from '@nestjs/common';
import { TransportsController } from './transports.controller';
import { TransportsService } from './transports.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TransportsController],
  providers: [PrismaService, TransportsService],
  exports: [TransportsService],
})
export class TransportsModule {}
