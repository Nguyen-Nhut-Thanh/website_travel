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

  async detail(id: number) {
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: id },
      include: {
        tour_destinations: {
          include: {
            locations: true
          },
          orderBy: { visit_order: 'asc' }
        },
        tour_images: {
          orderBy: { sort_order: 'asc' }
        },
        departure_locations: true,
        transports: true
      }
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return { tour };
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
        tour_type: true,
        base_price: true,
        status: true,
        updated_at: true,
        duration_nights: true,
        tour_images: {
          orderBy: { sort_order: 'asc' },
          take: 1,
          select: {
            image_url: true,
          }
        }
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

    try {
      return await this.prisma.$transaction(async (tx) => {
        const tour = await tx.tours.create({
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

        // Lưu danh sách địa điểm đến
        if (body.destinations && Array.isArray(body.destinations)) {
          await tx.tour_destinations.createMany({
            data: body.destinations.map((locId: number, idx: number) => ({
              tour_id: tour.tour_id,
              location_id: locId,
              visit_order: idx + 1
            })),
          });
        }

        // Lưu ảnh
        if (body.images && Array.isArray(body.images)) {
          await tx.tour_images.createMany({
            data: body.images.map((url: string, idx: number) => ({
              tour_id: tour.tour_id,
              image_url: url,
              is_cover: idx === 0 ? 1 : 0,
              sort_order: idx + 1
            })),
          });
        }

        return tour;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Mã Tour (code) đã tồn tại trên hệ thống.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Điểm khởi hành hoặc Phương tiện không hợp lệ.');
      }
      throw error;
    }
  }

  async update(id: number, body: any) {
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: id },
      include: {
        tour_schedules: {
          select: { tour_schedule_id: true }
        }
      }
    });

    if (!tour) throw new NotFoundException('Tour không tồn tại');

    // Đếm trực tiếp số lượng booking liên quan đến tất cả các schedule của tour này
    const scheduleIds = tour.tour_schedules.map(s => s.tour_schedule_id);
    const totalBookings = await this.prisma.bookings.count({
      where: { tour_schedule_id: { in: scheduleIds } }
    });

    if (totalBookings > 0) {
      // Các trường tuyệt đối không được sửa khi đã có khách
      const lockedFields = [
        'code', 
        'name', 
        'duration_days', 
        'duration_nights', 
        'departure_location'
      ];
      
      for (const field of lockedFields) {
        if (body[field] !== undefined && body[field] !== null) {
          const newValue = String(body[field]);
          const oldValue = String((tour as any)[field]);

          if (newValue !== oldValue) {
            throw new BadRequestException(
              `Trường '${field}' đã bị khóa vì tour này đang có ${totalBookings} đơn hàng.`
            );
          }
        }
      }

      // Riêng destinations, nếu có gửi mảng mới lên thì chặn luôn (vì nó là quan hệ n-n, check thay đổi phức tạp)
      if (body.destinations && Array.isArray(body.destinations)) {
        throw new BadRequestException('Không thể thay đổi danh sách điểm đến vì tour đã có khách đặt.');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedTour = await tx.tours.update({
          where: { tour_id: id },
          data: {
            name: body.name ?? undefined,
            summary: body.summary ?? undefined,
            description: body.description ?? undefined,
            duration_days: body.duration_days != null ? Number(body.duration_days) : undefined,
            duration_nights: body.duration_nights != null ? Number(body.duration_nights) : undefined,
            base_price: body.base_price != null ? Number(body.base_price) : undefined,
            tour_type: body.tour_type ?? undefined,
            departure_location: body.departure_location != null ? Number(body.departure_location) : undefined,
            transport_id: body.transport_id != null ? Number(body.transport_id) : undefined,
            sightseeing_summary: body.sightseeing_summary ?? undefined,
            cuisine_info: body.cuisine_info ?? undefined,
            best_for: body.best_for ?? undefined,
            best_time: body.best_time ?? undefined,
            transport_info: body.transport_info ?? undefined,
            promotion_info: body.promotion_info ?? undefined,
          },
        });

        if (body.destinations && Array.isArray(body.destinations)) {
          await tx.tour_destinations.deleteMany({ where: { tour_id: id } });
          await tx.tour_destinations.createMany({
            data: body.destinations.map((locId: number, idx: number) => ({
              tour_id: id,
              location_id: locId,
              visit_order: idx + 1
            })),
          });
        }

        if (body.images && Array.isArray(body.images)) {
          await tx.tour_images.deleteMany({ where: { tour_id: id } });
          await tx.tour_images.createMany({
            data: body.images.map((url: string, idx: number) => ({
              tour_id: id,
              image_url: url,
              is_cover: idx === 0 ? 1 : 0,
              sort_order: idx + 1
            })),
          });
        }

        return updatedTour;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Mã Tour (code) đã tồn tại trên hệ thống.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Thông tin Điểm đến hoặc Phương tiện không hợp lệ.');
      }
      throw error;
    }
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

  // --- SCHEDULE MANAGEMENT ---

  async listSchedules(tourId: number) {
    const items = await this.prisma.tour_schedules.findMany({
      where: { tour_id: tourId },
      orderBy: { start_date: 'asc' },
      include: {
        _count: { select: { bookings: true } }
      }
    });

    // Chuyển đổi Decimal sang Number và trả về code
    return items.map(item => ({
      ...item,
      price: Number(item.price)
    }));
  }

  async findOneSchedule(scheduleId: number) {
    const schedule = await this.prisma.tour_schedules.findUnique({
      where: { tour_schedule_id: scheduleId },
      include: {
        tour_schedule_prices: true,
        tour_schedule_transports: { include: { transports: true } },
        tour_schedule_hotels: { include: { hotels: true } },
        tour_itineraries: { orderBy: { day_number: 'asc' } },
      },
    });
    if (!schedule) throw new NotFoundException('Không tìm thấy lịch khởi hành');
    
    // Chuyển đổi các trường Decimal sang Number
    return {
      ...schedule,
      price: Number(schedule.price),
      tour_schedule_prices: schedule.tour_schedule_prices.map(p => ({
        ...p,
        price: Number(p.price)
      }))
    };
  }

  private mapScheduleResponse(item: any) {
    if (!item) return null;
    return {
      ...item,
      price: item.price ? Number(item.price) : 0,
      tour_schedule_prices: item.tour_schedule_prices?.map((p: any) => ({
        ...p,
        price: p.price ? Number(p.price) : 0,
      })) || [],
    };
  }

  private validatePrice(price: any) {
    const p = Number(price || 0);
    if (p < 0) return 0;
    if (p > 999999999) return 999999999; // Chặn tối đa 999 triệu để tránh overflow Decimal(12,2)
    return p;
  }

  async createSchedule(tourId: number, body: any) {
    this.requireFields(body, ['start_date', 'end_date', 'price', 'quota']);

    // Lấy thông tin tour gốc để lấy mã code
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: tourId },
      select: { code: true }
    });
    if (!tour) throw new NotFoundException('Tour không tồn tại');

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Tạo schedule trước để lấy ID
        const schedule = await tx.tour_schedules.create({
          data: {
            tour_id: tourId,
            start_date: new Date(body.start_date),
            end_date: new Date(body.end_date),
            price: this.validatePrice(body.price),
            quota: Number(body.quota),
            status: body.status != null ? Number(body.status) : 1,
            cover_image_url: body.cover_image_url || null,
          },
        });

        // 2. Cập nhật mã code duy nhất (MÃ GỐC - ID)
        const updatedSchedule = await tx.tour_schedules.update({
          where: { tour_schedule_id: schedule.tour_schedule_id },
          data: {
            code: `${tour.code}-${schedule.tour_schedule_id}`
          }
        });

        // 3. Lưu giá theo loại khách
        if (body.prices && Array.isArray(body.prices) && body.prices.length > 0) {
          await tx.tour_schedule_prices.createMany({
            data: body.prices.map((p: any) => ({
              tour_schedule_id: schedule.tour_schedule_id,
              passenger_type: p.passenger_type,
              price: this.validatePrice(p.price),
              currency: p.currency || 'VND',
              note: p.note || null,
            })),
          });
        }

        // 4. Lưu lịch trình chi tiết theo ngày
        if (body.itinerary && Array.isArray(body.itinerary) && body.itinerary.length > 0) {
          await tx.tour_itineraries.createMany({
            data: body.itinerary.map((it: any, idx: number) => ({
              tour_schedule_id: schedule.tour_schedule_id,
              day_number: it.day_number || idx + 1,
              title: it.title || `Ngày ${idx + 1}`,
              content: it.content || it.description || '',
              meals: it.meals || null,
            })),
          });
        }

        return updatedSchedule;
      });

      return this.mapScheduleResponse(result);
    } catch (error) {
      console.error('[Create Schedule Error]', error);
      if (error.code === 'P2003') {
        throw new BadRequestException('ID Tour không hợp lệ hoặc dữ liệu liên quan bị lỗi.');
      }
      throw new BadRequestException('Lỗi khi tạo lịch khởi hành: ' + error.message);
    }
  }

  async updateSchedule(scheduleId: number, body: any) {
    const existingSchedule = await this.prisma.tour_schedules.findUnique({
      where: { tour_schedule_id: scheduleId },
    });

    if (!existingSchedule) throw new NotFoundException('Lịch khởi hành không tồn tại');

    const now = new Date();
    const startDate = new Date(existingSchedule.start_date);

    // 1. Nếu tour đã khởi hành (Quá khứ) -> Khóa 100%
    if (startDate < now) {
      throw new BadRequestException('Không thể chỉnh sửa lịch trình đã khởi hành.');
    }

    // 2. Nếu tour tương lai và ĐÃ CÓ người đặt
    if (existingSchedule.booked_count > 0) {
      // Chặn sửa ngày và giá
      const lockedFields = ['start_date', 'end_date', 'price', 'prices', 'itinerary'];
      for (const field of lockedFields) {
        if (body[field] !== undefined && body[field] !== null) {
           throw new BadRequestException(`Không thể thay đổi ${field} vì đã có khách hàng đặt tour này.`);
        }
      }

      // Kiểm tra Quota
      if (body.quota !== undefined && body.quota !== null) {
        const newQuota = Number(body.quota);
        if (newQuota < existingSchedule.booked_count) {
          throw new BadRequestException(
            `Số lượng chỗ (quota) không được thấp hơn số khách đã đặt (${existingSchedule.booked_count}).`
          );
        }
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const schedule = await tx.tour_schedules.update({
          where: { tour_schedule_id: scheduleId },
          data: {
            start_date: body.start_date ? new Date(body.start_date) : undefined,
            end_date: body.end_date ? new Date(body.end_date) : undefined,
            price: body.price != null ? Number(body.price) : undefined,
            quota: body.quota != null ? Number(body.quota) : undefined,
            status: body.status != null ? Number(body.status) : undefined,
            cover_image_url: body.cover_image_url ?? undefined,
          },
        });

        // Cập nhật giá (Xóa cũ - Thêm mới)
        if (body.prices && Array.isArray(body.prices)) {
          await tx.tour_schedule_prices.deleteMany({ where: { tour_schedule_id: scheduleId } });
          if (body.prices.length > 0) {
            await tx.tour_schedule_prices.createMany({
              data: body.prices.map((p: any) => ({
                tour_schedule_id: scheduleId,
                passenger_type: p.passenger_type,
                price: Number(p.price || 0),
                currency: p.currency || 'VND',
                note: p.note || null,
              })),
            });
          }
        }

        // Cập nhật lịch trình (Xóa cũ - Thêm mới)
        if (body.itinerary && Array.isArray(body.itinerary)) {
          await tx.tour_itineraries.deleteMany({ where: { tour_schedule_id: scheduleId } });
          if (body.itinerary.length > 0) {
            await tx.tour_itineraries.createMany({
              data: body.itinerary.map((it: any, idx: number) => ({
                tour_schedule_id: scheduleId,
                day_number: it.day_number || idx + 1,
                title: it.title || `Ngày ${idx + 1}`,
                content: it.content || it.description || '',
                meals: it.meals || null,
              })),
            });
          }
        }

        return schedule;
      });

      return this.mapScheduleResponse(result);
    } catch (error) {
      console.error('[Update Schedule Error]', error);
      throw new BadRequestException('Lỗi khi cập nhật lịch khởi hành: ' + error.message);
    }
  }

  async deleteSchedule(scheduleId: number) {
    const bookingsCount = await this.prisma.bookings.count({
      where: { tour_schedule_id: scheduleId },
    });

    if (bookingsCount > 0) {
      throw new BadRequestException('Không thể xóa lịch trình đã có khách đặt.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Xóa các dữ liệu liên quan trước khi xóa lịch trình
      await tx.tour_itineraries.deleteMany({
        where: { tour_schedule_id: scheduleId },
      });
      await tx.tour_schedule_prices.deleteMany({
        where: { tour_schedule_id: scheduleId },
      });
      await tx.tour_schedule_hotels.deleteMany({
        where: { tour_schedule_id: scheduleId },
      });
      await tx.tour_schedule_transports.deleteMany({
        where: { tour_schedule_id: scheduleId },
      });

      return tx.tour_schedules.delete({
        where: { tour_schedule_id: scheduleId },
      });
    });
  }

  // --- CATALOG METHODS FOR DROPDOWNS ---

  async listHotels() {
    return this.prisma.hotels.findMany({
      orderBy: { name: 'asc' },
      select: { hotel_id: true, name: true, star_rating: true }
    });
  }

  async listHotelRoomTypes(hotelId: number) {
    return this.prisma.hotel_room_types.findMany({
      where: { hotel_id: hotelId },
      select: { room_type_id: true, name: true, base_price: true }
    });
  }

  async listAllTransports() {
    return this.prisma.transports.findMany({
      orderBy: { name: 'asc' },
      select: { transport_id: true, name: true, transport_type: true }
    });
  }
}
