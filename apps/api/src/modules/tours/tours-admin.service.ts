import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ToursAdminService {
  constructor(private readonly prisma: PrismaService) {}

  private async getTourOrThrow(id: number) {
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: id },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour;
  }

  private requireFields(body: Record<string, any>, fields: string[]) {
    for (const field of fields) {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        throw new BadRequestException(`Missing ${field}`);
      }
    }
  }

  async list(params: { search?: string; status?: string }) {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { code: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status === '0' || params.status === '1') {
      where.status = Number(params.status);
    }

    const items = await this.prisma.tours.findMany({
      where,
      orderBy: { updated_at: 'desc' },
      select: {
        tour_id: true,
        code: true,
        name: true,
        duration_days: true,
        base_price: true,
        status: true,
        updated_at: true,
      },
    });

    return { items };
  }

  async create(body: any) {
    this.requireFields(body, [
      'code',
      'name',
      'description',
      'duration_days',
      'departure_location',
      'transport_id',
    ]);

    return this.prisma.tours.create({
      data: {
        code: String(body.code).trim(),
        name: String(body.name).trim(),
        summary: body.summary ?? null,
        description: String(body.description),
        duration_days: Number(body.duration_days),
        duration_nights: Number(body.duration_nights ?? 0),
        base_price: Number(body.base_price ?? 0),
        tour_type: body.tour_type ?? 'domestic',
        departure_location: Number(body.departure_location),
        transport_id: Number(body.transport_id),
        status: body.status != null ? Number(body.status) : 1,
        sightseeing_summary: body.sightseeing_summary ?? null,
        cuisine_info: body.cuisine_info ?? null,
        best_for: body.best_for ?? null,
        best_time: body.best_time ?? null,
        transport_info: body.transport_info ?? null,
        promotion_info: body.promotion_info ?? null,
      },
    });
  }

  async detail(id: number) {
    const tour = await this.getTourOrThrow(id);
    return { tour };
  }

  async update(id: number, body: any) {
    await this.getTourOrThrow(id);

    return this.prisma.tours.update({
      where: { tour_id: id },
      data: {
        name: body.name ?? undefined,
        summary: body.summary ?? undefined,
        description: body.description ?? undefined,
        duration_days:
          body.duration_days != null ? Number(body.duration_days) : undefined,
        duration_nights:
          body.duration_nights != null
            ? Number(body.duration_nights)
            : undefined,
        base_price:
          body.base_price != null ? Number(body.base_price) : undefined,
        tour_type: body.tour_type ?? undefined,
        departure_location:
          body.departure_location != null
            ? Number(body.departure_location)
            : undefined,
        transport_id:
          body.transport_id != null ? Number(body.transport_id) : undefined,
        sightseeing_summary: body.sightseeing_summary ?? undefined,
        cuisine_info: body.cuisine_info ?? undefined,
        best_for: body.best_for ?? undefined,
        best_time: body.best_time ?? undefined,
        transport_info: body.transport_info ?? undefined,
        promotion_info: body.promotion_info ?? undefined,
      },
    });
  }

  async toggleStatus(id: number) {
    const tour = await this.getTourOrThrow(id);
    const nextStatus = tour.status === 1 ? 0 : 1;

    return this.prisma.tours.update({
      where: { tour_id: id },
      data: { status: nextStatus },
      select: { tour_id: true, status: true },
    });
  }
}
