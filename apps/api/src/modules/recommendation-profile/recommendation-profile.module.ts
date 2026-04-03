import { Module } from '@nestjs/common';
import { RecommendationProfileController } from './recommendation-profile.controller';
import { RecommendationProfileService } from './recommendation-profile.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [RecommendationProfileController],
  providers: [RecommendationProfileService, PrismaService],
  exports: [RecommendationProfileService],
})
export class RecommendationProfileModule {}
