import { Controller, Get, Query } from '@nestjs/common';
import { FeaturedToursService } from './featured-tours.service';

@Controller('public/featured-tours')
export class FeaturedToursController {
  constructor(private readonly featuredToursService: FeaturedToursService) {}

  @Get()
  async getFeaturedTours(@Query('limit') limit?: string) {
    const parsedLimit = Number(limit);

    return this.featuredToursService.getFeaturedTours(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 8,
    );
  }
}
