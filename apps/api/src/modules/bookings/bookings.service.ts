import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
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
  room_type?: 'shared' | 'single';
  single_room_surcharge?: number;
  travelers: Array<{
    fullName: string;
    gender: string;
    birthday: string;
    type: string;
  }>;
};

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private readonly adminBookingInclude = {
    users: {
      select: {
        full_name: true,
        phone: true,
        accounts: {
          select: {
            email: true,
          },
        },
      },
    },
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
          },
        },
      },
    },
    booking_travelers: true,
    payments: true,
    vouchers: true,
  } as const;

  private resolveRollbackStatus(paymentStatus?: string | null) {
    return paymentStatus === 'completed' ? 'paid' : 'pending';
  }

  private formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  private mergeBookingNote(
    existingNote: string | null | undefined,
    entry: string,
  ) {
    return [existingNote?.trim(), entry.trim()].filter(Boolean).join('\n\n');
  }

  private ensureStaffAccess(isStaff: boolean) {
    if (!isStaff) {
      throw new ForbiddenException('Bạn không có quyền truy cập.');
    }
  }

  private async findAdminBookingOrThrow(bookingId: number) {
    const booking = await this.prisma.bookings.findUnique({
      where: { booking_id: bookingId },
      include: this.adminBookingInclude,
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking.');
    }

    return booking;
  }

  private async findBookingForCancelActionOrThrow(bookingId: number) {
    const booking = await this.prisma.bookings.findUnique({
      where: { booking_id: bookingId },
      include: {
        payments: {
          orderBy: { payment_id: 'desc' },
          take: 1,
        },
        tour_schedules: {
          include: {
            tours: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking.');
    }

    return booking;
  }

  async createBooking(dto: CreateBookingDto) {
    const booking = await this.prisma.$transaction(async (tx) => {
      const schedule = await tx.tour_schedules.findUnique({
        where: { tour_schedule_id: dto.tour_schedule_id },
        include: {
          tour_schedule_prices: true,
          tours: {
            select: {
              name: true,
              status: true,
            },
          },
        },
      });

      if (!schedule || schedule.status !== 1) {
        throw new BadRequestException(
          'Lịch trình không tồn tại hoặc đã bị ẩn.',
        );
      }

      if (!schedule.tours || schedule.tours.status !== 1) {
        throw new BadRequestException(
          'Tour này hiện đang tạm ẩn và không nhận đặt mới.',
        );
      }

      const totalGuests = dto.adult_count + dto.child_count + dto.infant_count;
      if (schedule.quota - schedule.booked_count < totalGuests) {
        throw new BadRequestException(
          'Không đủ chỗ trống cho số lượng khách yêu cầu.',
        );
      }

      const adultPrice = Number(
        schedule.tour_schedule_prices.find((p) => p.passenger_type === 'ADULT')
          ?.price || schedule.price,
      );
      const childPrice = Number(
        schedule.tour_schedule_prices.find((p) => p.passenger_type === 'CHILD')
          ?.price || adultPrice * 0.8,
      );
      const infantPrice = Number(
        schedule.tour_schedule_prices.find((p) => p.passenger_type === 'INFANT')
          ?.price || adultPrice * 0.3,
      );

      const subtotal =
        dto.adult_count * adultPrice +
        dto.child_count * childPrice +
        dto.infant_count * infantPrice;
      const singleRoomSurcharge =
        dto.room_type === 'single'
          ? Math.max(Number(dto.single_room_surcharge || 0), 0)
          : 0;
      let discountAmount = 0;
      let voucherId: number | null = null;

      if (dto.voucher_code) {
        const voucher = await tx.vouchers.findFirst({
          where: {
            code: dto.voucher_code,
            status: 1,
            start_date: { lte: new Date() },
            expiry_date: { gte: new Date() },
          },
        });

        if (voucher && subtotal >= Number(voucher.min_order_value)) {
          if (voucher.discount_type === 'percentage') {
            discountAmount = subtotal * (Number(voucher.discount_value) / 100);
            if (voucher.max_discount_amount) {
              discountAmount = Math.min(
                discountAmount,
                Number(voucher.max_discount_amount),
              );
            }
          } else {
            discountAmount = Number(voucher.discount_value);
          }
          voucherId = voucher.voucher_id;
        }
      }

      const totalAmount = Math.max(
        subtotal + singleRoomSurcharge - discountAmount,
        0,
      );
      const roomNote =
        dto.room_type === 'single'
          ? `[ROOM_SELECTION]\nLoại phòng: PHÒNG ĐƠN\nPhụ thu phòng đơn: ${this.formatCurrency(singleRoomSurcharge)}đ`
          : `[ROOM_SELECTION]\nLoại phòng: GHÉP PHÒNG\nPhụ thu phòng đơn: 0đ`;
      const mergedNote = dto.note?.trim()
        ? `${dto.note.trim()}\n\n${roomNote}`
        : roomNote;

      const createdBooking = await tx.bookings.create({
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
          note: mergedNote,
          voucher_id: voucherId,
        },
      });

      if (dto.travelers?.length) {
        await tx.booking_travelers.createMany({
          data: dto.travelers.map((t) => ({
            booking_id: createdBooking.booking_id,
            full_name: t.fullName,
            gender: t.gender,
            dob: t.birthday ? new Date(t.birthday) : null,
            traveler_type: t.type.toUpperCase(),
          })),
        });
      }

      await tx.tour_schedules.update({
        where: { tour_schedule_id: dto.tour_schedule_id },
        data: { booked_count: { increment: totalGuests } },
      });

      return {
        ...createdBooking,
        tour_name: schedule.tours?.name || 'Tour',
        start_date: schedule.start_date,
      };
    });

    await this.mailService.sendBookingCreatedEmail({
      email: booking.contact_email,
      contactName: booking.contact_name,
      bookingId: booking.booking_id,
      tourName: booking.tour_name,
      startDate: booking.start_date,
      totalAmount: Number(booking.total_amount),
    });

    return booking;
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
          status: { not: 'cancelled' },
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

  async getAdminBookingDetail(bookingId: number, isStaff: boolean) {
    this.ensureStaffAccess(isStaff);
    return this.findAdminBookingOrThrow(bookingId);
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
              },
            },
          },
        },
        booking_travelers: true,
        payments: true,
        vouchers: true,
      },
    });
  }

  async requestCancel(bookingId: number, userId: number, reason?: string) {
    const booking = await this.prisma.bookings.findFirst({
      where: { booking_id: bookingId, user_id: userId },
      include: {
        tour_schedules: {
          include: {
            tours: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking.');
    }

    if (!['pending', 'paid'].includes(booking.status)) {
      throw new BadRequestException(
        'Booking hiện không thể gửi yêu cầu hủy.',
      );
    }

    const reasonText = reason?.trim();
    const updated = await this.prisma.bookings.update({
      where: { booking_id: bookingId },
      data: {
        status: 'cancel_requested',
        note: reasonText
          ? this.mergeBookingNote(
              booking.note,
              `[CUSTOMER_CANCEL_REQUEST]\nLý do: ${reasonText}`,
            )
          : booking.note,
      },
    });

    await this.mailService.sendCancelRequestEmail({
      email: booking.contact_email,
      contactName: booking.contact_name,
      bookingId: booking.booking_id,
      tourName: booking.tour_schedules?.tours?.name || 'Tour',
    });

    await this.mailService.sendCancelRequestAdminNotification({
      bookingId: booking.booking_id,
      tourName: booking.tour_schedules?.tours?.name || 'Tour',
      contactName: booking.contact_name,
      contactEmail: booking.contact_email,
      contactPhone: booking.contact_phone,
      reason: reasonText,
    });

    return updated;
  }

  async listAdminBookings(
    isStaff: boolean,
    page: number = 1,
    limit: number = 10,
  ) {
    this.ensureStaffAccess(isStaff);

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.bookings.findMany({
        skip,
        take: limit,
        include: {
          users: {
            select: {
              full_name: true,
            },
          },
          tour_schedules: {
            include: {
              tours: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.bookings.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approveCancel(
    bookingId: number,
    isStaff: boolean,
    note?: string,
    refundAmount?: number,
  ) {
    this.ensureStaffAccess(isStaff);

    const booking = await this.findBookingForCancelActionOrThrow(bookingId);

    if (booking.status !== 'cancel_requested') {
      throw new BadRequestException(
        'Booking này không ở trạng thái yêu cầu hủy.',
      );
    }

    const totalGuests =
      booking.adult_count + booking.child_count + booking.infant_count;

    const adminNote = note?.trim();
    const normalizedRefundAmount =
      typeof refundAmount === 'number' && Number.isFinite(refundAmount)
        ? Math.max(refundAmount, 0)
        : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      const approvalLines = ['[ADMIN_CANCEL_APPROVED]'];
      if (adminNote) {
        approvalLines.push(`Ghi chú: ${adminNote}`);
      }
      if (normalizedRefundAmount !== null) {
        approvalLines.push(
          `Số tiền hoàn dự kiến: ${this.formatCurrency(normalizedRefundAmount)}đ`,
        );
      }

      const cancelled = await tx.bookings.update({
        where: { booking_id: bookingId },
        data: {
          status: 'cancelled',
          note: this.mergeBookingNote(booking.note, approvalLines.join('\n')),
        },
      });

      await tx.tour_schedules.update({
        where: { tour_schedule_id: booking.tour_schedule_id },
        data: {
          booked_count: {
            decrement: totalGuests,
          },
        },
      });

      return cancelled;
    });

    await this.mailService.sendCancelApprovedEmail({
      email: booking.contact_email,
      contactName: booking.contact_name,
      bookingId: booking.booking_id,
      tourName: booking.tour_schedules?.tours?.name || 'Tour',
      refundAmount: normalizedRefundAmount,
    });

    return updated;
  }

  async rejectCancel(bookingId: number, isStaff: boolean, note?: string) {
    this.ensureStaffAccess(isStaff);

    const booking = await this.findBookingForCancelActionOrThrow(bookingId);

    if (booking.status !== 'cancel_requested') {
      throw new BadRequestException(
        'Booking này không ở trạng thái yêu cầu hủy.',
      );
    }

    const rollbackStatus = this.resolveRollbackStatus(
      booking.payments?.[0]?.status,
    );

    const adminNote = note?.trim();
    const updated = await this.prisma.bookings.update({
      where: { booking_id: bookingId },
      data: {
        status: rollbackStatus,
        note: adminNote
          ? this.mergeBookingNote(
              booking.note,
              `[ADMIN_CANCEL_REJECTED]\nGhi chú: ${adminNote}`,
            )
          : booking.note,
      },
    });

    await this.mailService.sendCancelRejectedEmail({
      email: booking.contact_email,
      contactName: booking.contact_name,
      bookingId: booking.booking_id,
      tourName: booking.tour_schedules?.tours?.name || 'Tour',
    });

    return updated;
  }
}
