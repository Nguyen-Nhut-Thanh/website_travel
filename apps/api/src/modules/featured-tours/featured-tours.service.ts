import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { toNumber, slugify, startOfToday } from '../../common/utils';

type FeaturedTourItem = {
  schedule_id: number;
  tour_id: number;
  code: string;
  name: string;
  route_text: string;
  departure_name: string;
  destination_name: string;
  start_date: string;
  hotel_name: string | null;
  transport_name: string | null;
  transport_type: string | null;
  price: number;
  cover_image_url: string | null;
  image_url: string | null;
  link: string;
};

type RankedTourCandidate = {
  tourId: number;
  nextScheduleId: number;
  nextStartDate: Date;
  nextPrice: number;
  bookingCount: number;
  passengerCount: number;
  bestsellerScore: number;
};

type BestSellerStat = {
  tour_id: number;
  booking_count: number;
  passenger_count: number;
};

@Injectable()
export class FeaturedToursService {
  constructor(private readonly prisma: PrismaService) {}

  private isFeaturedTourItem(
    item: FeaturedTourItem | null,
  ): item is FeaturedTourItem {
    return item !== null;
  }

  private pickBetterSchedule<T extends { start_date: Date; price: unknown }>(
    current: T | undefined,
    candidate: T,
  ) {
    if (!current) return candidate;

    if (candidate.start_date < current.start_date) {
      return candidate;
    }

    if (
      candidate.start_date.getTime() === current.start_date.getTime() &&
      toNumber(candidate.price) < toNumber(current.price)
    ) {
      return candidate;
    }

    return current;
  }

  private async getBestSellerStats(): Promise<BestSellerStat[]> {
    return this.prisma.$queryRaw<BestSellerStat[]>`
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
  }

  async getFeaturedTours(limit = 8): Promise<{
    items: FeaturedTourItem[];
    total: number;
    fetched_at: string;
  }> {
    const today = startOfToday();

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
        start_date: true,
        price: true,
        quota: true,
        booked_count: true,
      },
      orderBy: [{ start_date: 'asc' }, { price: 'asc' }],
    });

    const availableSchedules = activeSchedules.filter(
      (schedule) => schedule.quota > schedule.booked_count,
    );

    if (availableSchedules.length === 0) {
      return {
        items: [],
        total: 0,
        fetched_at: new Date().toISOString(),
      };
    }

    const nextScheduleByTour = new Map<
      number,
      (typeof availableSchedules)[number]
    >();

    for (const schedule of availableSchedules) {
      nextScheduleByTour.set(
        schedule.tour_id,
        this.pickBetterSchedule(
          nextScheduleByTour.get(schedule.tour_id),
          schedule,
        ),
      );
    }

    const availableTourIds = new Set(nextScheduleByTour.keys());
    const allBestSellerStats = await this.getBestSellerStats();
    const rankedTours: RankedTourCandidate[] = allBestSellerStats
      .filter((stat) => availableTourIds.has(stat.tour_id))
      .slice(0, Math.max(limit * 3, 25))
      .map((stat) => {
        const tourId = stat.tour_id;
        const nextSchedule = nextScheduleByTour.get(tourId);
        if (!nextSchedule) return null;

        const bookingCount = stat.booking_count;
        const passengerCount = stat.passenger_count;
        const bestsellerScore = passengerCount * 4 + bookingCount * 2;

        return {
          tourId,
          nextScheduleId: nextSchedule.tour_schedule_id,
          nextStartDate: nextSchedule.start_date,
          nextPrice: toNumber(nextSchedule.price),
          bookingCount,
          passengerCount,
          bestsellerScore,
        };
      })
      .filter((item): item is RankedTourCandidate => item !== null)
      .sort((left, right) => {
        if (right.bestsellerScore !== left.bestsellerScore) {
          return right.bestsellerScore - left.bestsellerScore;
        }

        if (right.passengerCount !== left.passengerCount) {
          return right.passengerCount - left.passengerCount;
        }

        if (right.bookingCount !== left.bookingCount) {
          return right.bookingCount - left.bookingCount;
        }

        if (left.nextStartDate.getTime() !== right.nextStartDate.getTime()) {
          return left.nextStartDate.getTime() - right.nextStartDate.getTime();
        }

        return left.nextPrice - right.nextPrice;
      })
      .slice(0, limit);

    const fallbackRankedTours =
      rankedTours.length > 0
        ? rankedTours
        : Array.from(nextScheduleByTour.entries())
            .map(([tourId, nextSchedule]) => ({
              tourId,
              nextScheduleId: nextSchedule.tour_schedule_id,
              nextStartDate: nextSchedule.start_date,
              nextPrice: toNumber(nextSchedule.price),
              bookingCount: 0,
              passengerCount: 0,
              bestsellerScore: 0,
            }))
            .sort((left, right) => {
              if (
                left.nextStartDate.getTime() !== right.nextStartDate.getTime()
              ) {
                return (
                  left.nextStartDate.getTime() - right.nextStartDate.getTime()
                );
              }

              return left.nextPrice - right.nextPrice;
            })
            .slice(0, limit);

    const rankedTourIdOrder = fallbackRankedTours.map((item) => item.tourId);

    const schedules = await this.prisma.tour_schedules.findMany({
      where: {
        tour_schedule_id: {
          in: fallbackRankedTours.map((item) => item.nextScheduleId),
        },
      },
      include: {
        tours: {
          include: {
            departure_locations: true,
            transports: true,
            tour_images: {
              orderBy: [
                { is_cover: 'desc' },
                { sort_order: 'asc' },
                { image_id: 'asc' },
              ],
              take: 1,
            },
            tour_destinations: {
              include: {
                locations: true,
              },
              orderBy: {
                visit_order: 'asc',
              },
            },
          },
        },
        tour_schedule_hotels: {
          include: {
            hotels: true,
          },
          orderBy: [{ day_from: 'asc' }, { schedule_hotel_id: 'asc' }],
          take: 1,
        },
        tour_schedule_transports: {
          include: {
            transports: true,
          },
          orderBy: [{ day_from: 'asc' }, { schedule_transport_id: 'asc' }],
          take: 1,
        },
        tour_schedule_prices: {
          orderBy: [{ passenger_type: 'asc' }, { schedule_price_id: 'asc' }],
          take: 5,
        },
      },
    });

    const detailedSchedulesByTourId = new Map(
      schedules.map((schedule) => [schedule.tour_id, schedule]),
    );

    const items: FeaturedTourItem[] = rankedTourIdOrder
      .map((tourId) => detailedSchedulesByTourId.get(tourId) ?? null)
      .map((schedule): FeaturedTourItem | null => {
        if (!schedule) return null;

        const tour = schedule.tours;

        if (!tour) return null;

        const price = toNumber(
          schedule.tour_schedule_prices[0]?.price ?? schedule.price,
        );

        const departureName =
          tour.departure_locations?.name ?? 'TP. Hồ Chí Minh';
        const destinationName =
          tour.tour_destinations[tour.tour_destinations.length - 1]?.locations
            ?.name ?? tour.name;

        const hotelName =
          schedule.tour_schedule_hotels[0]?.hotels?.name ?? null;

        const transportName =
          schedule.tour_schedule_transports[0]?.transports?.name ??
          tour.transports?.name ??
          null;

        const transportType =
          schedule.tour_schedule_transports[0]?.transports?.transport_type ??
          tour.transports?.transport_type ??
          null;

        const coverImageUrl = schedule.cover_image_url ?? null;
        const imageUrl = tour.tour_images[0]?.image_url ?? null;

        const slug = slugify(tour.name);

        return {
          schedule_id: schedule.tour_schedule_id,
          tour_id: tour.tour_id,
          code: tour.code,
          name: tour.name,
          route_text:
            departureName && destinationName
              ? `${departureName} → ${destinationName}`
              : tour.name,
          departure_name: departureName,
          destination_name: destinationName,
          start_date: schedule.start_date.toISOString(),
          hotel_name: hotelName,
          transport_name: transportName,
          transport_type: transportType,
          price,
          cover_image_url: coverImageUrl,
          image_url: imageUrl,
          link: `/tours/${tour.tour_id}-${slug}`,
        };
      })
      .filter((item): item is FeaturedTourItem => item !== null)
      .slice(0, limit);

    return {
      items,
      total: items.length,
      fetched_at: new Date().toISOString(),
    };
  }
}
