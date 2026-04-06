import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { VoucherPayload } from './vouchers.types';

@Controller()
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('admin/marketing/vouchers')
  async findAll() {
    return this.vouchersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/marketing/vouchers/:id')
  async findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/marketing/vouchers')
  async create(@Body() data: VoucherPayload) {
    return this.vouchersService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/marketing/vouchers/:id')
  async update(@Param('id') id: string, @Body() data: VoucherPayload) {
    return this.vouchersService.update(Number(id), data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/marketing/vouchers/:id')
  async remove(@Param('id') id: string) {
    return this.vouchersService.remove(Number(id));
  }

  @Get('public/vouchers/validate')
  async validateVoucher(
    @Query('code') code: string,
    @Query('amount') amount: string,
  ) {
    return this.vouchersService.validateVoucher(code, Number(amount));
  }
}
