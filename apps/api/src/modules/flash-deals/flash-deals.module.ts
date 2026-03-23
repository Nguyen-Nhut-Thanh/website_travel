import { Module } from '@nestjs/common';
import { FlashDealsController } from './flash-deals.controller';
import { FlashDealsService } from './flash-deals.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [FlashDealsController],
  providers: [FlashDealsService, PrismaService],
})
export class FlashDealsModule {}
