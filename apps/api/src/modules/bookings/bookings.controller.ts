import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { BookingsService } from './bookings.service';

type AuthUser = {
  sub: number;
  isStaff?: boolean;
};

type AuthRequest = Request & {
  user: AuthUser;
};

type CreateBookingBody = {
  tour_schedule_id: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  note?: string;
  voucher_code?: string;
  payment_method: string;
  room_type?: 'shared' | 'single';
  single_room_surcharge?: number;
  travelers: Array<{
    fullName: string;
    gender: string;
    birthday: string;
    type: string;
  }>;
};

type CancelRequestBody = {
  reason?: string;
};

type AdminCancelActionBody = {
  note?: string;
  refundAmount?: number;
};

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() dto: CreateBookingBody, @Req() req: AuthRequest) {
    return this.bookingsService.createBooking({
      ...dto,
      user_id: req.user.sub,
    });
  }

  @Get('my')
  async getMyBookings(@Req() req: AuthRequest) {
    return this.bookingsService.getMyBookings(req.user.sub);
  }

  @Get('stats')
  async getStats(@Req() req: AuthRequest) {
    return this.bookingsService.getBookingStats(req.user.sub);
  }

  @Get('admin/list')
  async getAdminBookings(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingsService.listAdminBookings(
      Boolean(req.user.isStaff),
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Get('admin/:id')
  async getAdminDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.bookingsService.getAdminBookingDetail(
      id,
      Boolean(req.user.isStaff),
    );
  }

  @Post(':id/cancel-request')
  async requestCancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CancelRequestBody,
    @Req() req: AuthRequest,
  ) {
    return this.bookingsService.requestCancel(id, req.user.sub, body.reason);
  }

  @Post('admin/:id/approve-cancel')
  async approveCancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminCancelActionBody,
    @Req() req: AuthRequest,
  ) {
    return this.bookingsService.approveCancel(
      id,
      Boolean(req.user.isStaff),
      body.note,
      body.refundAmount,
    );
  }

  @Post('admin/:id/reject-cancel')
  async rejectCancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminCancelActionBody,
    @Req() req: AuthRequest,
  ) {
    return this.bookingsService.rejectCancel(
      id,
      Boolean(req.user.isStaff),
      body.note,
    );
  }

  @Get(':id')
  async getDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.bookingsService.getBookingDetail(id, req.user.sub);
  }
}
