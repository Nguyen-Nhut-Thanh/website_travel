import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

type PublicListParams = {
  search?: string;
  destination?: string;
  departure_location?: string;
  date_from?: string;
  min_price?: string;
  max_price?: string;
  take?: string;
  skip?: string;
};

@Injectable()
export class ToursPublicService {
  constructor(private readonly prisma: PrismaService) {}

  private startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private normalizeDate(dateFrom?: string) {
    if (!dateFrom) return this.startOfToday();

    const parsed = new Date(dateFrom);
    if (Number.isNaN(parsed.getTime())) return this.startOfToday();

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  private parseMoney(value?: string) {
    if (!value) return undefined;
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return undefined;
    return parsed;
  }

  private buildCardSelect(scheduleStartDate: Date) {
    return {
      tour_id: true,
      code: true,
      name: true,
      summary: true,
      duration_days: true,
      duration_nights: true,
      base_price: true,
      tour_type: true,
      updated_at: true,

      locations: {
        select: {
          location_id: true,
          name: true,
        },
      },

      tour_images: {
        where: { is_cover: 1 },
        orderBy: { sort_order: 'asc' as const },
        take: 1,
        select: {
          image_url: true,
        },
      },

      tour_destinations: {
        orderBy: { visit_order: 'asc' as const },
        take: 5,
        select: {
          visit_order: true,
          locations: {
            select: {
              location_id: true,
              name: true,
            },
          },
        },
      },

      tour_schedules: {
        where: {
          status: 1,
          start_date: { gte: scheduleStartDate },
        },
        orderBy: { start_date: 'asc' as const },
        take: 1,
        select: {
          tour_schedule_id: true,
          start_date: true,
          end_date: true,
          price: true,
          quota: true,
          booked_count: true,
        },
      },
    };
  }

  private formatTourCard(t: any) {
    return {
      tour_id: t.tour_id,
      code: t.code,
      name: t.name,
      summary: t.summary ?? null,
      duration_days: t.duration_days,
      duration_nights: t.duration_nights,
      base_price: Number(t.base_price ?? 0),
      tour_type: t.tour_type,
      updated_at: t.updated_at,

      cover_image: t.tour_images?.[0]?.image_url ?? null,

      departure_location: t.locations
        ? {
            location_id: t.locations.location_id,
            name: t.locations.name,
          }
        : null,

      destinations: Array.isArray(t.tour_destinations)
        ? t.tour_destinations.map((item: any) => ({
            visit_order: item.visit_order,
            location_id: item.locations?.location_id ?? null,
            name: item.locations?.name ?? null,
          }))
        : [],

      next_schedule: t.tour_schedules?.[0]
        ? {
            ...t.tour_schedules[0],
            price: Number(t.tour_schedules[0].price ?? 0),
          }
        : null,

      rating_avg: t.rating_avg != null ? Number(t.rating_avg) : null,
      rating_count: t.rating_count != null ? Number(t.rating_count) : 0,
    };
  }

  private async getRatingsMap(ids: number[]) {
    if (!ids.length) {
      return new Map<number, { rating_avg: number; rating_count: number }>();
    }

    const rows = await this.prisma.$queryRaw<
      { tour_id: number; rating_avg: number; rating_count: number }[]
    >`
      SELECT tour_id,
             AVG(rating)::float AS rating_avg,
             COUNT(*)::int AS rating_count
      FROM reviews
      WHERE status = 1
        AND tour_id = ANY(${ids})
      GROUP BY tour_id
    `;

    return new Map(rows.map((row) => [row.tour_id, row]));
  }

  async homeFeed() {
    const today = this.startOfToday();
    const baseSelect = this.buildCardSelect(today);

    const itemsRaw = await this.prisma.tours.findMany({
      where: {
        status: 1,
        tour_schedules: {
          some: {
            status: 1,
            start_date: { gte: today },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
      take: 8,
      select: baseSelect,
    });

    const ids = itemsRaw.map((item) => item.tour_id);
    const ratingMap = await this.getRatingsMap(ids);

    return {
      featured: itemsRaw.map((t) => {
        const rating = ratingMap.get(t.tour_id);
        return this.formatTourCard({
          ...t,
          rating_avg: rating?.rating_avg,
          rating_count: rating?.rating_count,
        });
      }),
    };
  }

  async publicList(params: PublicListParams) {
    const scheduleStartDate = this.normalizeDate(params.date_from);
    const minPrice = this.parseMoney(params.min_price);
    const maxPrice = this.parseMoney(params.max_price);

    const take = Math.min(Math.max(Number(params.take || 20), 1), 50);
    const skip = Math.max(Number(params.skip || 0), 0);

    const where: Prisma.toursWhereInput = {
      status: 1,
    };

    const search = params.search?.trim();
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        {
          locations: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          tour_destinations: {
            some: {
              locations: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    if (params.departure_location) {
      const departureLocationId = Number(params.departure_location);
      if (!Number.isNaN(departureLocationId)) {
        where.departure_location = departureLocationId;
      }
    }

    const destination = params.destination?.trim();
    if (destination) {
      const currentAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
          ? [where.AND]
          : [];

      where.AND = [
        ...currentAnd,
        {
          tour_destinations: {
            some: {
              locations: {
                name: { contains: destination, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const scheduleFilter: Prisma.tour_schedulesWhereInput = {
      status: 1,
      start_date: { gte: scheduleStartDate },
    };

    if (minPrice != null || maxPrice != null) {
      scheduleFilter.price = {};
      if (minPrice != null) {
        scheduleFilter.price.gte = minPrice;
      }
      if (maxPrice != null) {
        scheduleFilter.price.lte = maxPrice;
      }
    }

    where.tour_schedules = {
      some: scheduleFilter,
    };

    const [itemsRaw, total] = await Promise.all([
      this.prisma.tours.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        take,
        skip,
        select: this.buildCardSelect(scheduleStartDate),
      }),
      this.prisma.tours.count({ where }),
    ]);

    const ids = itemsRaw.map((item) => item.tour_id);
    const ratingMap = await this.getRatingsMap(ids);

    return {
      items: itemsRaw.map((t) => {
        const rating = ratingMap.get(t.tour_id);
        return this.formatTourCard({
          ...t,
          rating_avg: rating?.rating_avg,
          rating_count: rating?.rating_count,
        });
      }),
      total,
      take,
      skip,
      filters: {
        search: params.search ?? '',
        destination: params.destination ?? '',
        departure_location: params.departure_location ?? '',
        date_from: params.date_from ?? '',
        min_price: params.min_price ?? '',
        max_price: params.max_price ?? '',
      },
    };
  }

  async publicDetail(tourId: number) {
    const tour = await this.prisma.tours.findFirst({
      where: {
        tour_id: tourId,
        status: 1,
      },
      select: {
        tour_id: true,
        code: true,
        name: true,
        summary: true,
        description: true,
        duration_days: true,
        duration_nights: true,
        base_price: true,
        tour_type: true,
        sightseeing_summary: true,
        cuisine_info: true,
        best_for: true,
        best_time: true,
        transport_info: true,
        promotion_info: true,

        locations: {
          select: {
            location_id: true,
            name: true,
          },
        },

        tour_images: {
          orderBy: { sort_order: 'asc' },
          select: {
            image_id: true,
            image_url: true,
            is_cover: true,
            sort_order: true,
          },
        },

        tour_destinations: {
          orderBy: { visit_order: 'asc' },
          select: {
            visit_order: true,
            note: true,
            locations: {
              select: {
                location_id: true,
                name: true,
              },
            },
          },
        },

        tour_schedules: {
          where: { status: 1 },
          orderBy: { start_date: 'asc' },
          select: {
            tour_schedule_id: true,
            start_date: true,
            end_date: true,
            price: true,
            quota: true,
            booked_count: true,
            tour_itineraries: {
              orderBy: { day_number: 'asc' },
              select: {
                day_number: true,
                title: true,
                content: true,
                meals: true,
              },
            },
            tour_schedule_prices: {
              select: {
                passenger_type: true,
                price: true,
                currency: true,
                note: true,
              },
            },
          },
        },

        reviews: {
          where: { status: 1 },
          orderBy: { created_at: 'desc' },
          take: 10,
          select: {
            review_id: true,
            rating: true,
            comment: true,
            created_at: true,
            user_id: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour;
  }
}
