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
import { FlashDealsService } from './flash-deals.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller()
export class FlashDealsController {
  constructor(private readonly flashDealsService: FlashDealsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('admin/marketing/flash-deals')
  async findAllAdmin() {
    return this.flashDealsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/marketing/flash-deals')
  async create(@Body() data: any) {
    return this.flashDealsService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/marketing/flash-deals/:id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.flashDealsService.update(Number(id), data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/marketing/flash-deals/:id')
  async remove(@Param('id') id: string) {
    return this.flashDealsService.remove(Number(id));
  }

  @Get('public/flash-deals')
  async getFlashDeals(@Query('limit') limit?: string) {
    const parsedLimit = Number(limit);
    return this.flashDealsService.getFlashDeals(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 8,
    );
  }
}
