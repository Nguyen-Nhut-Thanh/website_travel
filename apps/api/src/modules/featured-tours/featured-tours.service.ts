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

@Injectable()
export class FeaturedToursService {
  constructor(private readonly prisma: PrismaService) {}

  private isFeaturedTourItem(
    item: FeaturedTourItem | null,
  ): item is FeaturedTourItem {
    return item !== null;
  }

  async getFeaturedTours(limit = 8): Promise<{
    items: FeaturedTourItem[];
    total: number;
    fetched_at: string;
  }> {
    const today = startOfToday();

    const schedules = await this.prisma.tour_schedules.findMany({
      where: {
        status: 1,
        start_date: {
          gte: today,
        },
        tours: {
          status: 1,
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
              take: 1,
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
      orderBy: [{ start_date: 'asc' }, { price: 'asc' }],
      take: limit * 3,
    });

    const items: FeaturedTourItem[] = schedules
      .map((schedule): FeaturedTourItem | null => {
        const tour = schedule.tours;

        if (!tour) return null;

        const price = toNumber(
          schedule.tour_schedule_prices[0]?.price ?? schedule.price,
        );

        const departureName =
          tour.departure_locations?.name ?? 'TP. Hồ Chí Minh';
        const destinationName =
          tour.tour_destinations[0]?.locations?.name ?? tour.name;

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
          route_text: `${departureName} → ${destinationName}`,
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
      .filter(this.isFeaturedTourItem)
      .slice(0, limit);

    return {
      items,
      total: items.length,
      fetched_at: new Date().toISOString(),
    };
  }
}
