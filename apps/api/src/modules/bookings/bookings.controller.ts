import { Controller, Get, Post, Body, Req, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    return this.bookingsService.createBooking({
      ...dto,
      user_id: req.user.sub,
    });
  }

  @Get('my')
  async getMyBookings(@Req() req: any) {
    return this.bookingsService.getMyBookings(req.user.sub);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.bookingsService.getBookingStats(req.user.sub);
  }

  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.bookingsService.getBookingDetail(id, req.user.sub);
  }
}
