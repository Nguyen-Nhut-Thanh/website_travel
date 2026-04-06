import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

type RecentBookingRecord = {
  booking_id: number;
  created_at: Date;
  total_amount: unknown;
  status: string;
  contact_name: string;
  users?: { full_name: string | null } | null;
  tour_schedules?: {
    tours?: {
      name?: string | null;
      code?: string | null;
    } | null;
  } | null;
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private readonly revenueStatuses = ['confirmed', 'completed', 'paid'] as const;

  private mapRecentBooking(booking: RecentBookingRecord) {
    return {
      id: `BK${booking.booking_id.toString().padStart(3, '0')}`,
      tourCode: booking.tour_schedules?.tours?.code || 'N/A',
      customer: booking.users?.full_name || booking.contact_name,
      tour: booking.tour_schedules?.tours?.name || 'N/A',
      date: booking.created_at.toISOString(),
      amount: Number(booking.total_amount),
      status: booking.status,
    };
  }

  async getStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRevenueRes,
      bookingsThisMonth,
      activeTours,
      newUsers,
      recentBookingsRaw,
    ] = await Promise.all([
      this.prisma.bookings.aggregate({
        where: {
          status: { in: [...this.revenueStatuses] },
        },
        _sum: {
          total_amount: true,
        },
      }),
      this.prisma.bookings.count({
        where: {
          created_at: { gte: firstDayOfMonth },
        },
      }),
      this.prisma.tours.count({
        where: {
          status: 1,
        },
      }),
      this.prisma.users.count({
        where: {
          created_at: { gte: firstDayOfMonth },
        },
      }),
      this.prisma.bookings.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: { full_name: true },
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
        },
      }),
    ]);

    const totalRevenue = Number(totalRevenueRes._sum.total_amount || 0);

    return {
      totalRevenue,
      bookingsThisMonth,
      activeTours,
      newUsers,
      recentBookings: recentBookingsRaw.map((booking) =>
        this.mapRecentBooking(booking),
      ),
    };
  }
}
