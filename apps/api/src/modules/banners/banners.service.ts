import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicBanners() {
    return this.prisma.banners.findMany({
      where: {
        status: 1,
      },
      orderBy: { banner_id: 'asc' }, // Sắp xếp theo ID tăng dần
    });
  }

  // --- ADMIN METHODS ---

  async findAll() {
    return this.prisma.banners.findMany({
      orderBy: { banner_id: 'asc' }, // Sắp xếp theo ID tăng dần
    });
  }

  async findOne(id: number) {
    const banner = await this.prisma.banners.findUnique({
      where: { banner_id: id },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async create(data: any) {
    return this.prisma.banners.create({
      data: {
        location_name: data.location_name,
        header: data.header,
        description: data.description,
        image_url: data.image_url,
        status: data.status ? Number(data.status) : 1,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.banners.update({
      where: { banner_id: id },
      data: {
        location_name: data.location_name ?? undefined,
        header: data.header ?? undefined,
        description: data.description ?? undefined,
        image_url: data.image_url ?? undefined,
        status: data.status !== undefined ? Number(data.status) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.banners.delete({
      where: { banner_id: id },
    });
  }
}
