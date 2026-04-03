import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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
      // 1. Tổng doanh thu (từ các booking đã được xác nhận, thanh toán hoặc hoàn thành)
      this.prisma.bookings.aggregate({
        where: {
          status: { in: ['confirmed', 'completed', 'paid'] },
        },
        _sum: {
          total_amount: true,
        },
      }),

      // 2. Đơn đặt tour trong tháng
      this.prisma.bookings.count({
        where: {
          created_at: { gte: firstDayOfMonth },
        },
      }),

      // 3. Tour đang hoạt động
      this.prisma.tours.count({
        where: {
          status: 1,
        },
      }),

      // 4. Khách hàng mới trong tháng
      this.prisma.users.count({
        where: {
          created_at: { gte: firstDayOfMonth },
        },
      }),

      // 5. 5 Đơn đặt tour mới nhất
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
      recentBookings: recentBookingsRaw.map((b) => ({
        id: `BK${b.booking_id.toString().padStart(3, '0')}`,
        tourCode: b.tour_schedules?.tours?.code || 'N/A',
        customer: b.users?.full_name || b.contact_name,
        tour: b.tour_schedules?.tours?.name || 'N/A',
        date: b.created_at.toISOString(),
        amount: Number(b.total_amount),
        status: b.status,
      })),
    };
  }
}
