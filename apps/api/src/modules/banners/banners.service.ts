import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicBanners() {
    return this.prisma.banners.findMany({
      where: {
        status: 1,
      },
      orderBy: [{ sort_order: 'asc' }, { banner_id: 'asc' }],
      select: {
        banner_id: true,
        location_name: true,
        header: true,
        description: true,
        image_url: true,
        link_to: true,
        sort_order: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
