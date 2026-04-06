import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { BannerPayload } from './banners.types';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureExists(id: number) {
    const banner = await this.prisma.banners.findUnique({
      where: { banner_id: id },
    });

    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    return banner;
  }

  private normalizePayload(data: BannerPayload) {
    return {
      location_name: data.location_name ?? undefined,
      header: data.header ?? undefined,
      description: data.description ?? undefined,
      image_url: data.image_url ?? undefined,
      status: data.status !== undefined ? Number(data.status) : undefined,
    };
  }

  async getPublicBanners() {
    return this.prisma.banners.findMany({
      where: { status: 1 },
      orderBy: { banner_id: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.banners.findMany({
      orderBy: { banner_id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.ensureExists(id);
  }

  async create(data: BannerPayload) {
    const payload = this.normalizePayload(data);

    return this.prisma.banners.create({
      data: {
        location_name: payload.location_name ?? '',
        header: payload.header ?? '',
        description: payload.description ?? '',
        image_url: payload.image_url ?? '',
        status: payload.status ?? 1,
      },
    });
  }

  async update(id: number, data: BannerPayload) {
    await this.ensureExists(id);

    return this.prisma.banners.update({
      where: { banner_id: id },
      data: this.normalizePayload(data),
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);

    return this.prisma.banners.delete({
      where: { banner_id: id },
    });
  }
}
