import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ToursPublicService } from './tours-public.service';

@Controller('tours/public')
export class PublicToursController {
  constructor(private readonly toursPublicService: ToursPublicService) {}

  @Get('home')
  homeFeed() {
    return this.toursPublicService.homeFeed();
  }

  @Get()
  publicList(
    @Query('search') search?: string,
    @Query('destination') destination?: string,
    @Query('departure_location') departure_location?: string,
    @Query('date_from') date_from?: string,
    @Query('min_price') min_price?: string,
    @Query('max_price') max_price?: string,
    @Query('collection') collection?: string,
    @Query('deal') deal?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.toursPublicService.publicList({
      search,
      destination,
      departure_location,
      date_from,
      min_price,
      max_price,
      collection,
      deal,
      take,
      skip,
    });
  }

  @Get(':tourId')
  publicDetail(@Param('tourId', ParseIntPipe) tourId: number) {
    return this.toursPublicService.publicDetail(tourId);
  }
}
