//apps/api/src/modules/tours/tours.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  list(@Query('search') search?: string, @Query('status') status?: string) {
    return this.toursService.list({ search, status });
  }

  @Post()
  create(@Body() body: any) {
    return this.toursService.create(body);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.toursService.detail(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.toursService.update(Number(id), body);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string) {
    return this.toursService.toggleStatus(Number(id));
  }
}
