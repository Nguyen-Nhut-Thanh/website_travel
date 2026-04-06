import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TransportsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return {
      items: await this.prisma.transports.findMany({
        orderBy: { transport_id: 'asc' },
        select: { transport_id: true, name: true, transport_type: true },
      }),
    };
  }
}
