import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FeaturedToursController } from './featured-tours.controller';
import { FeaturedToursService } from './featured-tours.service';

@Module({
  controllers: [FeaturedToursController],
  providers: [FeaturedToursService, PrismaService],
})
export class FeaturedToursModule {}
