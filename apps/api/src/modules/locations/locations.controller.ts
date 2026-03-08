import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/locations')
export class LocationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const items = await this.prisma.locations.findMany({
      orderBy: { location_id: 'asc' },
      select: { location_id: true, name: true },
    });
    return { items };
  }
}
