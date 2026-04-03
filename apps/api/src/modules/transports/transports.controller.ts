import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TransportsService } from './transports.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/transports')
export class TransportsController {
  constructor(private readonly transportsService: TransportsService) {}

  @Get()
  async list() {
    return this.transportsService.findAll();
  }
}
