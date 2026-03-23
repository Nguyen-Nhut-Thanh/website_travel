import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RecommendationProfileService } from './recommendation-profile.service';

@Controller('recommendation-profile')
@UseGuards(JwtAuthGuard)
export class RecommendationProfileController {
  constructor(
    private readonly recommendationProfileService: RecommendationProfileService,
  ) {}

  @Get('me')
  async getMyProfile(@Req() req: any) {
    return this.recommendationProfileService.getProfile(req.user.sub);
  }

  @Put('me')
  async updateMyProfile(@Req() req: any, @Body() body: any) {
    return this.recommendationProfileService.upsertProfile(req.user.sub, body);
  }

  @Post('events')
  async trackEvent(@Req() req: any, @Body() body: any) {
    return this.recommendationProfileService.trackEvent(req.user.sub, body);
  }
}
