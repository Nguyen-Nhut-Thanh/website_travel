import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/transports')
export class TransportsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const items = await this.prisma.transports.findMany({
      orderBy: { transport_id: 'asc' },
      select: { transport_id: true, name: true, transport_type: true },
    });
    return { items };
  }
}
