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
  collection?: string;
  deal?: string;
  take?: string;
  skip?: string;
};

type BestSellerStat = {
  tour_id: number;
  booking_count: number;
  passenger_count: number;
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

  private buildCardSelect() {
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
      cut_off_hours: true, // Lấy thêm cut_off_hours

      departure_locations: {
        select: {
          location_id: true,
          name: true,
          slug: true,
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
              slug: true,
            },
          },
        },
      },

      tour_schedules: {
        where: {
          status: 1,
          start_date: { gte: new Date() }, // Lấy tất cả tương lai trước, sau đó lọc kỹ ở format
        },
        orderBy: { start_date: 'asc' as const },
        select: {
          tour_schedule_id: true,
          code: true,
          start_date: true,
          end_date: true,
          price: true,
          quota: true,
          booked_count: true,
          cover_image_url: true,
          flash_deals: {
            where: {
              status: 1,
              start_date: { lte: new Date() },
              end_date: { gte: new Date() },
            },
          },
        },
      },

      transports: {
        select: {
          name: true,
          transport_type: true,
        },
      },
    };
  }

  private formatTourCard(
    t: any,
    options?: {
      onlyFlashDeal?: boolean;
    },
  ) {
    const now = new Date();
    const cutOffHours = t.cut_off_hours || 24;
    const onlyFlashDeal = options?.onlyFlashDeal === true;

    // Lọc các lịch khởi hành chưa bị chốt khách và còn chỗ
    const schedules = Array.isArray(t.tour_schedules)
      ? t.tour_schedules
          .filter((s: any) => {
            const departureDate = new Date(s.start_date);
            const diffMs = departureDate.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            const isTimeValid = diffHours >= cutOffHours;
            const hasSpace = (s.quota || 0) > (s.booked_count || 0);

            if (onlyFlashDeal) {
              return isTimeValid && hasSpace && Boolean(s.flash_deals);
            }

            return isTimeValid && hasSpace;
          })
          .map((s: any) => {
            const originalPrice = Number(s.price ?? 0);
            let salePrice = originalPrice;
            const flashDeal = s.flash_deals || null;

            if (flashDeal) {
              const discountValue = Number(flashDeal.discount_value);
              if (flashDeal.discount_type === 'percentage') {
                salePrice = originalPrice * (1 - discountValue / 100);
              } else {
                salePrice = originalPrice - discountValue;
              }
            }

            return {
              ...s,
              price: Math.round(salePrice),
              original_price: originalPrice,
              flash_deal: flashDeal,
            };
          })
      : [];

    if (schedules.length === 0) return null; // Ẩn tour nếu không còn lịch khởi hành khả dụng

    const next_schedule = schedules[0] || null;

    return {
      tour_id: t.tour_id,
      code: next_schedule?.code || t.code,
      name: t.name,
      summary: t.summary ?? null,
      duration_days: t.duration_days,
      duration_nights: t.duration_nights,
      base_price: Number(t.base_price ?? 0),
      tour_type: t.tour_type,
      updated_at: t.updated_at,

      cover_image:
        next_schedule?.cover_image_url || t.tour_images?.[0]?.image_url || null,

      departure_location: t.departure_locations
        ? {
            location_id: t.departure_locations.location_id,
            name: t.departure_locations.name,
            slug: t.departure_locations.slug ?? null,
          }
        : null,

      destinations: Array.isArray(t.tour_destinations)
        ? t.tour_destinations.map((item: any) => ({
            visit_order: item.visit_order,
            location_id: item.locations?.location_id ?? null,
            name: item.locations?.name ?? null,
            slug: item.locations?.slug ?? null,
          }))
        : [],

      next_schedule,
      upcoming_schedules: schedules,

      transport: t.transports
        ? {
            name: t.transports.name,
            type: t.transports.transport_type,
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

  private async getBestSellerOrder(today: Date) {
    const activeSchedules = await this.prisma.tour_schedules.findMany({
      where: {
        status: 1,
        start_date: {
          gte: today,
        },
        tours: {
          status: 1,
        },
      },
      select: {
        tour_schedule_id: true,
        tour_id: true,
        quota: true,
        booked_count: true,
      },
    });

    const availableSchedules = activeSchedules.filter(
      (schedule) => schedule.quota > schedule.booked_count,
    );

    if (availableSchedules.length === 0) {
      return [];
    }

    const availableTourIds = new Set(
      availableSchedules.map((schedule) => schedule.tour_id),
    );

    const bestSellerStats = await this.prisma.$queryRaw<BestSellerStat[]>`
      SELECT
        ts.tour_id,
        COUNT(b.booking_id)::int AS booking_count,
        COALESCE(SUM(b.adult_count + b.child_count + b.infant_count), 0)::int AS passenger_count
      FROM bookings b
      INNER JOIN tour_schedules ts
        ON ts.tour_schedule_id = b.tour_schedule_id
      WHERE b.status <> 'cancelled'
      GROUP BY ts.tour_id
      ORDER BY passenger_count DESC, booking_count DESC, ts.tour_id DESC
    `;

    const rankedTourIds = bestSellerStats
      .filter((stat) => availableTourIds.has(stat.tour_id))
      .map((stat) => stat.tour_id);

    const missingAvailableTourIds = Array.from(availableTourIds).filter(
      (tourId) => !rankedTourIds.includes(tourId),
    );

    return [...rankedTourIds, ...missingAvailableTourIds];
  }

  async homeFeed() {
    const baseSelect = this.buildCardSelect();

    const itemsRaw = await this.prisma.tours.findMany({
      where: {
        status: 1,
        tour_schedules: {
          some: {
            status: 1,
            start_date: { gte: new Date() },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
      take: 20, // Lấy nhiều hơn để sau khi filter vẫn đủ 8 cái
      select: baseSelect,
    });

    const items = itemsRaw
      .map((t) => this.formatTourCard(t))
      .filter((t) => t !== null) // Lọc bỏ tour đã bị chốt khách
      .slice(0, 8); // Chỉ lấy đúng 8 cái cho trang chủ

    const ids = items.map((item) => item.tour_id);
    const ratingMap = await this.getRatingsMap(ids);

    return {
      featured: items.map((card) => {
        const rating = ratingMap.get(card.tour_id);
        const t = itemsRaw.find((raw) => raw.tour_id === card.tour_id);

        return {
          ...card,
          rating_avg: rating?.rating_avg,
          rating_count: rating?.rating_count,
          route_text: card.name,
          departure_name: card.departure_location?.name ?? '',
          destination_name: card.destinations?.[0]?.name ?? '',
          start_date: card.next_schedule?.start_date ?? '',
          hotel_name: 'Tiêu chuẩn',
          transport_name: card.transport?.name ?? '',
          transport_type: card.transport?.type ?? '',
          image_url: card.cover_image,
          link: `/tours/${card.tour_id}`,
        };
      }),
    };
  }

  async publicList(params: PublicListParams) {
    const today = new Date();
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
          departure_locations: {
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
                OR: [
                  { name: { contains: destination, mode: 'insensitive' } },
                  { slug: { equals: destination } },
                ],
              },
            },
          },
        },
      ];
    }

    const scheduleFilter: Prisma.tour_schedulesWhereInput = {
      status: 1,
      start_date: { gte: today },
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

    if (params.deal === 'flash') {
      scheduleFilter.flash_deals = {
        status: 1,
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
      };
    }

    where.tour_schedules = {
      some: scheduleFilter,
    };

    const [itemsRaw, total] = await Promise.all([
      this.prisma.tours.findMany({
        where,
        orderBy:
          params.collection === 'bestseller'
            ? undefined
            : { updated_at: 'desc' },
        // Chúng ta không skip/take ở đây vì cần filter cut_off_hours ở tầng ứng dụng
        select: this.buildCardSelect(),
      }),
      this.prisma.tours.count({ where }),
    ]);

    const items = itemsRaw
      .map((t) =>
        this.formatTourCard(t, { onlyFlashDeal: params.deal === 'flash' }),
      )
      .filter((t) => t !== null);

    const resolvedItems =
      params.collection === 'bestseller'
        ? await (async () => {
            const bestSellerOrder = new Map<number, number>();
            const bestSellerTourIds = await this.getBestSellerOrder(today);

            bestSellerTourIds.forEach((tourId, index) => {
              bestSellerOrder.set(tourId, index);
            });

            return [...items].sort((left, right) => {
              const leftRank = bestSellerOrder.get(left.tour_id);
              const rightRank = bestSellerOrder.get(right.tour_id);

              if (leftRank != null && rightRank != null) {
                return leftRank - rightRank;
              }

              if (leftRank != null) return -1;
              if (rightRank != null) return 1;

              return 0;
            });
          })()
        : items;

    // Xử lý phân trang thủ công sau khi filter
    const paginatedItems = resolvedItems.slice(skip, skip + take);

    const ids = paginatedItems.map((item) => item.tour_id);
    const ratingMap = await this.getRatingsMap(ids);

    return {
      items: paginatedItems.map((card) => {
        const rating = ratingMap.get(card.tour_id);
        return {
          ...card,
          rating_avg: rating?.rating_avg,
          rating_count: rating?.rating_count,
        };
      }),
      total: resolvedItems.length,
      take,
      skip,
      filters: {
        search: params.search ?? '',
        destination: params.destination ?? '',
        departure_location: params.departure_location ?? '',
        date_from: params.date_from ?? '',
        min_price: params.min_price ?? '',
        max_price: params.max_price ?? '',
        collection: params.collection ?? '',
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
        cut_off_hours: true,

        departure_locations: {
          select: {
            location_id: true,
            name: true,
            slug: true,
          },
        },
        transports: {
          select: {
            name: true,
            transport_type: true,
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
                slug: true,
              },
            },
          },
        },

        tour_schedules: {
          where: { status: 1, start_date: { gte: new Date() } },
          orderBy: { start_date: 'asc' },
          select: {
            tour_schedule_id: true,
            start_date: true,
            end_date: true,
            price: true,
            quota: true,
            booked_count: true,
            flash_deals: {
              where: {
                status: 1,
                start_date: { lte: new Date() },
                end_date: { gte: new Date() },
              },
            },
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
        tour_policies: {
          orderBy: { policy_id: 'asc' },
          select: {
            policy_id: true,
            policy_type: true,
            content: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    const now = new Date();
    const cutOffHours = tour.cut_off_hours || 24;

    // Lọc lịch trình khả dụng dựa trên cut_off_hours và quota
    const processedSchedules = tour.tour_schedules
      .filter((s: any) => {
        const departureDate = new Date(s.start_date);
        const diffHours =
          (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        const isTimeValid = diffHours >= cutOffHours;
        const hasSpace = (s.quota || 0) > (s.booked_count || 0);

        return isTimeValid && hasSpace;
      })
      .map((s: any) => {
        const originalPrice = Number(s.price || 0);
        let effectivePrice = originalPrice;
        const flashDeal = s.flash_deals;

        if (flashDeal) {
          if (flashDeal.discount_type === 'percentage') {
            effectivePrice =
              originalPrice * (1 - Number(flashDeal.discount_value) / 100);
          } else {
            effectivePrice = originalPrice - Number(flashDeal.discount_value);
          }
        }

        return {
          ...s,
          original_price: originalPrice,
          price: effectivePrice,
          flash_deal: flashDeal,
        };
      });

    return {
      ...tour,
      tour_schedules: processedSchedules,
    };
  }
}
