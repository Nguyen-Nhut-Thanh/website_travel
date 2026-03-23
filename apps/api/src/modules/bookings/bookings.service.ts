import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

type CreateBookingDto = {
  user_id: number;
  tour_schedule_id: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  note?: string;
  voucher_code?: string;
  payment_method: string;
  travelers: Array<{
    fullName: string;
    gender: string;
    birthday: string;
    type: string;
  }>;
};

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(dto: CreateBookingDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra lịch trình tour
      const schedule = await tx.tour_schedules.findUnique({
        where: { tour_schedule_id: dto.tour_schedule_id },
        include: { tour_schedule_prices: true }
      });

      if (!schedule || schedule.status !== 1) {
        throw new BadRequestException('Lịch trình không tồn tại hoặc đã bị ẩn.');
      }

      const totalGuests = dto.adult_count + dto.child_count + dto.infant_count;
      if (schedule.quota - schedule.booked_count < totalGuests) {
        throw new BadRequestException('Không đủ chỗ trống cho số lượng khách yêu cầu.');
      }

      // 2. Lấy giá thực tế từ database
      const adultPrice = Number(schedule.tour_schedule_prices.find(p => p.passenger_type === 'ADULT')?.price || schedule.price);
      const childPrice = Number(schedule.tour_schedule_prices.find(p => p.passenger_type === 'CHILD')?.price || adultPrice * 0.8);
      const infantPrice = Number(schedule.tour_schedule_prices.find(p => p.passenger_type === 'INFANT')?.price || adultPrice * 0.3);

      let subtotal = (dto.adult_count * adultPrice) + (dto.child_count * childPrice) + (dto.infant_count * infantPrice);
      let discountAmount = 0;
      let voucherId: number | null = null;

      // 3. Xử lý Voucher nếu có
      if (dto.voucher_code) {
        const voucher = await tx.vouchers.findFirst({
          where: { 
            code: dto.voucher_code, 
            status: 1,
            start_date: { lte: new Date() },
            expiry_date: { gte: new Date() }
          }
        });

        if (voucher) {
          if (subtotal >= Number(voucher.min_order_value)) {
            if (voucher.discount_type === 'percentage') {
              discountAmount = subtotal * (Number(voucher.discount_value) / 100);
              if (voucher.max_discount_amount) {
                discountAmount = Math.min(discountAmount, Number(voucher.max_discount_amount));
              }
            } else {
              discountAmount = Number(voucher.discount_value);
            }
            voucherId = voucher.voucher_id;
          }
        }
      }

      const totalAmount = Math.max(subtotal - discountAmount, 0);

      // 4. Tạo Booking (Khớp với Schema Prisma)
      const booking = await tx.bookings.create({
        data: {
          user_id: dto.user_id,
          tour_schedule_id: dto.tour_schedule_id,
          contact_name: dto.contact_name,
          contact_phone: dto.contact_phone,
          contact_email: dto.contact_email,
          adult_count: dto.adult_count,
          child_count: dto.child_count,
          infant_count: dto.infant_count,
          adult_unit_price: adultPrice,
          child_unit_price: childPrice,
          infant_unit_price: infantPrice,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          status: 'pending',
          note: dto.note,
          voucher_id: voucherId,
        }
      });

      // 5. Tạo danh sách hành khách
      if (dto.travelers && dto.travelers.length > 0) {
        await tx.booking_travelers.createMany({
          data: dto.travelers.map(t => ({
            booking_id: booking.booking_id,
            full_name: t.fullName,
            gender: t.gender,
            dob: new Date(t.birthday),
            traveler_type: t.type.toUpperCase()
          }))
        });
      }

      // 6. Cập nhật booked_count của schedule
      await tx.tour_schedules.update({
        where: { tour_schedule_id: dto.tour_schedule_id },
        data: { booked_count: { increment: totalGuests } }
      });

      return booking;
    });
  }

  async getMyBookings(userId: number) {
    return this.prisma.bookings.findMany({
      where: { user_id: userId },
      include: {
        tour_schedules: {
          include: {
            tours: {
              include: {
                tour_images: {
                  where: { is_cover: 1 },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getBookingStats(userId: number) {
    const [total, pending, upcoming] = await Promise.all([
      this.prisma.bookings.count({ where: { user_id: userId } }),
      this.prisma.bookings.count({
        where: { user_id: userId, status: 'pending' },
      }),
      this.prisma.bookings.count({
        where: {
          user_id: userId,
          tour_schedules: {
            start_date: { gte: new Date() },
          },
        },
      }),
    ]);

    const favorites = await this.prisma.favorites.count({
      where: { user_id: userId },
    });

    return {
      totalBookings: total,
      pendingPayments: pending,
      upcomingTrips: upcoming,
      totalFavorites: favorites,
    };
  }

  async getBookingDetail(bookingId: number, userId: number) {
    return this.prisma.bookings.findFirst({
      where: { booking_id: bookingId, user_id: userId },
      include: {
        tour_schedules: {
          include: {
            tours: {
              include: {
                tour_images: { where: { is_cover: 1 }, take: 1 },
                departure_locations: {
                  select: {
                    name: true,
                  },
                },
              }
            }
          }
        },
        booking_travelers: true,
        payments: true,
        vouchers: true
      }
    });
  }
}
