import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RecommendationProfileService } from './recommendation-profile.service';
import type { AuthRequestUser } from '../auth/auth.types';
import type {
  RecommendationEventPayload,
  RecommendationProfilePayload,
} from './recommendation-profile.types';

type AuthRequest = Request & {
  user: AuthRequestUser;
};

@Controller('recommendation-profile')
@UseGuards(JwtAuthGuard)
export class RecommendationProfileController {
  constructor(
    private readonly recommendationProfileService: RecommendationProfileService,
  ) {}

  @Get('me')
  async getMyProfile(@Req() req: AuthRequest) {
    return this.recommendationProfileService.getProfile(req.user.sub);
  }

  @Put('me')
  async updateMyProfile(
    @Req() req: AuthRequest,
    @Body() body: RecommendationProfilePayload,
  ) {
    return this.recommendationProfileService.upsertProfile(req.user.sub, body);
  }

  @Post('events')
  async trackEvent(
    @Req() req: AuthRequest,
    @Body() body: RecommendationEventPayload,
  ) {
    return this.recommendationProfileService.trackEvent(req.user.sub, body);
  }
}
