import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { toNumber, slugify } from '../../common/utils';

type FlashDealItem = {
  deal_id: number;
  schedule_id: number;
  tour_id: number;
  code: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  image_url: string | null;
  departure_name: string;
  start_date: string;
  end_date: string;
  duration_text: string;
  original_price: number;
  sale_price: number;
  discount_value: number;
  discount_type: string;
  seats_left: number;
  discount_percent: number;
  countdown_to: string;
  link: string;
  promotion_info: string | null;
  transport_type: string | null;
};

@Injectable()
export class FlashDealsService {
  constructor(private readonly prisma: PrismaService) {}

  // Hàm làm tròn tiền đến hàng nghìn gần nhất
  private roundToThousand(amount: number): number {
    return Math.round(amount / 1000) * 1000;
  }

  // --- Admin Methods ---

  async findAllAdmin() {
    return this.prisma.tour_schedules.findMany({
      include: {
        tours: {
          select: {
            name: true,
            code: true,
            base_price: true,
          },
        },
        flash_deals: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { start_date: 'asc' },
    });
  }

  async create(data: any) {
    const existing = await this.prisma.flash_deals.findUnique({
      where: { tour_schedule_id: data.tour_schedule_id },
    });
    if (existing)
      throw new BadRequestException('Lịch khởi hành này đã có flash deal rồi');

    // Chuyển đổi logic giờ sang ngày tháng
    const schedule = await this.prisma.tour_schedules.findUnique({
      where: { tour_schedule_id: Number(data.tour_schedule_id) },
    });
    if (!schedule) throw new NotFoundException('Không tìm thấy lịch khởi hành');

    const startDate = new Date(data.start_date || Date.now());
    // Mặc định kết thúc là lúc tour khởi hành
    const endDate = schedule.start_date;

    return this.prisma.flash_deals.create({
      data: {
        tour_schedule_id: Number(data.tour_schedule_id),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        start_date: startDate,
        end_date: endDate,
        status: data.status !== undefined ? Number(data.status) : 1,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.flash_deals.update({
      where: { deal_id: id },
      data: {
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        status: data.status !== undefined ? Number(data.status) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.flash_deals.delete({
      where: { deal_id: id },
    });
  }

  // --- Public Methods ---

  async getFlashDeals(limit = 8): Promise<{
    items: FlashDealItem[];
    total: number;
    fetched_at: string;
  }> {
    const now = new Date();

    const deals = await this.prisma.flash_deals.findMany({
      where: {
        status: 1,
        start_date: { lte: now },
        end_date: { gte: now },
        tour_schedules: {
          status: 1,
          start_date: { gte: now },
        },
      },
      include: {
        tour_schedules: {
          include: {
            tours: {
              include: {
                departure_locations: true,
                transports: true,
                tour_images: {
                  where: { is_cover: 1 },
                  take: 1,
                },
              },
            },
            tour_schedule_prices: {
              where: { passenger_type: 'adult' },
              take: 1,
            },
          },
        },
      },
      orderBy: { end_date: 'asc' },
      take: limit,
    });

    const items: FlashDealItem[] = deals.map((deal) => {
      const schedule = deal.tour_schedules;
      const tour = schedule.tours;

      const originalPrice = toNumber(
        schedule.tour_schedule_prices[0]?.price ?? schedule.price,
      );
      let salePrice = originalPrice;
      let discountPercent = 0;

      if (deal.discount_type === 'percentage') {
        discountPercent = toNumber(deal.discount_value);
        salePrice = this.roundToThousand(
          originalPrice * (1 - discountPercent / 100),
        );
      } else {
        const discountAmount = toNumber(deal.discount_value);
        salePrice = originalPrice - discountAmount;
        discountPercent = Math.round((discountAmount / originalPrice) * 100);
      }

      const seatsLeft = Math.max(
        toNumber(schedule.quota) - toNumber(schedule.booked_count),
        0,
      );
      const slug = slugify(tour.name);

      return {
        deal_id: deal.deal_id,
        schedule_id: schedule.tour_schedule_id,
        tour_id: tour.tour_id,
        code: schedule.code || tour.code,
        name: tour.name,
        slug,
        cover_image_url:
          schedule.cover_image_url || tour.tour_images[0]?.image_url || null,
        image_url: tour.tour_images[0]?.image_url || null,
        departure_name: tour.departure_locations?.name || 'Chưa cập nhật',
        start_date: schedule.start_date.toISOString(),
        end_date: schedule.end_date.toISOString(),
        duration_text: `${tour.duration_days}N${tour.duration_nights}Đ`,
        original_price: originalPrice,
        sale_price: salePrice,
        discount_value: toNumber(deal.discount_value),
        discount_type: deal.discount_type,
        seats_left: seatsLeft,
        discount_percent: discountPercent,
        countdown_to: deal.end_date.toISOString(),
        link: `/tours/${tour.tour_id}-${slug}`,
        promotion_info: tour.promotion_info || null,
        transport_type: (tour as any).transports?.name || null,
      };
    });

    return {
      items,
      total: items.length,
      fetched_at: new Date().toISOString(),
    };
  }
}
