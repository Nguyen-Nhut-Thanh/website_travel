import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ToursAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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
            locations: true,
          },
          orderBy: { visit_order: 'asc' },
        },
        tour_images: {
          orderBy: { sort_order: 'asc' },
        },
        tour_schedules: {
          select: {
            tour_schedule_id: true,
            _count: {
              select: {
                bookings: true,
              },
            },
          },
        },
        departure_locations: true,
        transports: true,
        tour_policies: {
          orderBy: { policy_id: 'asc' },
        },
      },
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
          },
        },
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

        if (body.policy_contents && typeof body.policy_contents === 'object') {
          const policyEntries = Object.entries(body.policy_contents)
            .map(([policy_type, content]) => ({
              policy_type,
              content: String(content ?? '').trim(),
            }))
            .filter((entry) => entry.content.length > 0);

          if (policyEntries.length > 0) {
            await tx.tour_policies.createMany({
              data: policyEntries.map((entry) => ({
                tour_id: tour.tour_id,
                policy_type: entry.policy_type,
                content: entry.content,
              })),
            });
          }
        }

        // LÃƒâ€ Ã‚Â°u danh sÃƒÆ’Ã‚Â¡ch Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹a Ãƒâ€žÃ¢â‚¬ËœiÃƒÂ¡Ã‚Â»Ã†â€™m Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â¿n
        if (body.destinations && Array.isArray(body.destinations)) {
          await tx.tour_destinations.createMany({
            data: body.destinations.map((locId: number, idx: number) => ({
              tour_id: tour.tour_id,
              location_id: locId,
              visit_order: idx + 1,
            })),
          });
        }

        // LÃƒâ€ Ã‚Â°u ÃƒÂ¡Ã‚ÂºÃ‚Â£nh
        if (body.images && Array.isArray(body.images)) {
          await tx.tour_images.createMany({
            data: body.images.map((url: string, idx: number) => ({
              tour_id: tour.tour_id,
              image_url: url,
              is_cover: idx === 0 ? 1 : 0,
              sort_order: idx + 1,
            })),
          });
        }

        return tour;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'MÃƒÆ’Ã‚Â£ Tour (code) Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i trÃƒÆ’Ã‚Âªn hÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡ thÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœng.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Ãƒâ€žÃ‚ÂiÃƒÂ¡Ã‚Â»Ã†â€™m khÃƒÂ¡Ã‚Â»Ã…Â¸i hÃƒÆ’Ã‚Â nh hoÃƒÂ¡Ã‚ÂºÃ‚Â·c PhÃƒâ€ Ã‚Â°Ãƒâ€ Ã‚Â¡ng tiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n khÃƒÆ’Ã‚Â´ng hÃƒÂ¡Ã‚Â»Ã‚Â£p lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡.',
        );
      }
      throw error;
    }
  }

  async update(id: number, body: any) {
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: id },
      include: {
        tour_schedules: {
          select: { tour_schedule_id: true },
        },
        tour_destinations: {
          select: { location_id: true },
          orderBy: { visit_order: 'asc' },
        },
      },
    });

    if (!tour) throw new NotFoundException('Tour khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i');

    // Ãƒâ€žÃ‚ÂÃƒÂ¡Ã‚ÂºÃ‚Â¿m trÃƒÂ¡Ã‚Â»Ã‚Â±c tiÃƒÂ¡Ã‚ÂºÃ‚Â¿p sÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœ lÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£ng booking liÃƒÆ’Ã‚Âªn quan Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â¿n tÃƒÂ¡Ã‚ÂºÃ‚Â¥t cÃƒÂ¡Ã‚ÂºÃ‚Â£ cÃƒÆ’Ã‚Â¡c schedule cÃƒÂ¡Ã‚Â»Ã‚Â§a tour nÃƒÆ’Ã‚Â y
    const scheduleIds = tour.tour_schedules.map((s) => s.tour_schedule_id);
    const totalBookings = await this.prisma.bookings.count({
      where: { tour_schedule_id: { in: scheduleIds } },
    });

    if (totalBookings > 0) {
      // CÃƒÆ’Ã‚Â¡c trÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Âng tuyÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡t Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœi khÃƒÆ’Ã‚Â´ng Ãƒâ€žÃ¢â‚¬ËœÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£c sÃƒÂ¡Ã‚Â»Ã‚Â­a khi Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ cÃƒÆ’Ã‚Â³ khÃƒÆ’Ã‚Â¡ch
      const lockedFields = [
        'code',
        'name',
        'duration_days',
        'duration_nights',
        'tour_type',
        'departure_location',
      ];

      for (const field of lockedFields) {
        if (body[field] !== undefined && body[field] !== null) {
          const newValue = String(body[field]);
          const oldValue = String((tour as any)[field]);

          if (newValue !== oldValue) {
            throw new BadRequestException(
              `Không thể thay đổi trường '${field}' vì tour này đã có ${totalBookings} booking.`,
            );
          }
        }
      }

      // RiÃƒÆ’Ã‚Âªng destinations, nÃƒÂ¡Ã‚ÂºÃ‚Â¿u cÃƒÆ’Ã‚Â³ gÃƒÂ¡Ã‚Â»Ã‚Â­i mÃƒÂ¡Ã‚ÂºÃ‚Â£ng mÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºi lÃƒÆ’Ã‚Âªn thÃƒÆ’Ã‚Â¬ chÃƒÂ¡Ã‚ÂºÃ‚Â·n luÃƒÆ’Ã‚Â´n (vÃƒÆ’Ã‚Â¬ nÃƒÆ’Ã‚Â³ lÃƒÆ’Ã‚Â  quan hÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡ n-n, check thay Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i phÃƒÂ¡Ã‚Â»Ã‚Â©c tÃƒÂ¡Ã‚ÂºÃ‚Â¡p)
      if (body.destinations && Array.isArray(body.destinations)) {
        const currentDestinations = tour.tour_destinations
          .map((item) => item.location_id)
          .sort((a, b) => a - b);
        const nextDestinations = body.destinations
          .map((value: number | string) => Number(value))
          .sort((a: number, b: number) => a - b);

        const destinationsChanged =
          currentDestinations.length !== nextDestinations.length ||
          currentDestinations.some(
            (value, index) => value !== nextDestinations[index],
          );

        if (destinationsChanged) {
          throw new BadRequestException(
            'Không thể thay đổi danh sách điểm đến vì tour này đã có booking.',
          );
        }
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
            duration_days:
              body.duration_days != null
                ? Number(body.duration_days)
                : undefined,
            duration_nights:
              body.duration_nights != null
                ? Number(body.duration_nights)
                : undefined,
            base_price:
              body.base_price != null ? Number(body.base_price) : undefined,
            tour_type: body.tour_type ?? undefined,
            departure_location:
              body.departure_location != null
                ? Number(body.departure_location)
                : undefined,
            transport_id:
              body.transport_id != null ? Number(body.transport_id) : undefined,
            sightseeing_summary: body.sightseeing_summary ?? undefined,
            cuisine_info: body.cuisine_info ?? undefined,
            best_for: body.best_for ?? undefined,
            best_time: body.best_time ?? undefined,
            transport_info: body.transport_info ?? undefined,
            promotion_info: body.promotion_info ?? undefined,
          },
        });

        if (body.policy_contents && typeof body.policy_contents === 'object') {
          await tx.tour_policies.deleteMany({
            where: { tour_id: id },
          });

          const policyEntries = Object.entries(body.policy_contents)
            .map(([policy_type, content]) => ({
              policy_type,
              content: String(content ?? '').trim(),
            }))
            .filter((entry) => entry.content.length > 0);

          if (policyEntries.length > 0) {
            await tx.tour_policies.createMany({
              data: policyEntries.map((entry) => ({
                tour_id: id,
                policy_type: entry.policy_type,
                content: entry.content,
              })),
            });
          }
        }

        if (body.destinations && Array.isArray(body.destinations)) {
          await tx.tour_destinations.deleteMany({ where: { tour_id: id } });
          await tx.tour_destinations.createMany({
            data: body.destinations.map((locId: number, idx: number) => ({
              tour_id: id,
              location_id: locId,
              visit_order: idx + 1,
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
              sort_order: idx + 1,
            })),
          });
        }

        return updatedTour;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'MÃƒÆ’Ã‚Â£ Tour (code) Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i trÃƒÆ’Ã‚Âªn hÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡ thÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœng.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'ThÃƒÆ’Ã‚Â´ng tin Ãƒâ€žÃ‚ÂiÃƒÂ¡Ã‚Â»Ã†â€™m Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â¿n hoÃƒÂ¡Ã‚ÂºÃ‚Â·c PhÃƒâ€ Ã‚Â°Ãƒâ€ Ã‚Â¡ng tiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n khÃƒÆ’Ã‚Â´ng hÃƒÂ¡Ã‚Â»Ã‚Â£p lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡.',
        );
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

  async deleteTour(id: number) {
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: id },
      include: {
        tour_schedules: {
          select: { tour_schedule_id: true },
        },
        tour_destinations: {
          select: { location_id: true },
          orderBy: { visit_order: 'asc' },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i');
    }

    const scheduleIds = tour.tour_schedules.map((schedule) => schedule.tour_schedule_id);

    if (scheduleIds.length > 0) {
      const bookingsCount = await this.prisma.bookings.count({
        where: {
          tour_schedule_id: { in: scheduleIds },
        },
      });

      if (bookingsCount > 0) {
        throw new BadRequestException(
          'KhÃƒÆ’Ã‚Â´ng thÃƒÂ¡Ã‚Â»Ã†â€™ xÃƒÆ’Ã‚Â³a tour vÃƒÆ’Ã‚Â¬ Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ cÃƒÆ’Ã‚Â³ lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch khÃƒÂ¡Ã‚Â»Ã…Â¸i hÃƒÆ’Ã‚Â nh phÃƒÆ’Ã‚Â¡t sinh khÃƒÆ’Ã‚Â¡ch Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â·t.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (scheduleIds.length > 0) {
        await tx.tour_itineraries.deleteMany({
          where: { tour_schedule_id: { in: scheduleIds } },
        });
        await tx.tour_schedule_prices.deleteMany({
          where: { tour_schedule_id: { in: scheduleIds } },
        });
        await tx.tour_schedule_hotels.deleteMany({
          where: { tour_schedule_id: { in: scheduleIds } },
        });
        await tx.tour_schedule_transports.deleteMany({
          where: { tour_schedule_id: { in: scheduleIds } },
        });
        await tx.tour_schedules.deleteMany({
          where: { tour_schedule_id: { in: scheduleIds } },
        });
      }

      await tx.favorites.deleteMany({
        where: { tour_id: id },
      });
      await tx.reviews.deleteMany({
        where: { tour_id: id },
      });
      await tx.tour_destinations.deleteMany({
        where: { tour_id: id },
      });
      await tx.tour_images.deleteMany({
        where: { tour_id: id },
      });
      await tx.tour_policies.deleteMany({
        where: { tour_id: id },
      });

      return tx.tours.delete({
        where: { tour_id: id },
      });
    });
  }

  // --- SCHEDULE MANAGEMENT ---

  async listSchedules(tourId: number) {
    const items = await this.prisma.tour_schedules.findMany({
      where: { tour_id: tourId },
      orderBy: { start_date: 'asc' },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    // ChuyÃƒÂ¡Ã‚Â»Ã†â€™n Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i Decimal sang Number vÃƒÆ’Ã‚Â  trÃƒÂ¡Ã‚ÂºÃ‚Â£ vÃƒÂ¡Ã‚Â»Ã‚Â code
    return items.map((item) => ({
      ...item,
      price: Number(item.price),
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
    if (!schedule) throw new NotFoundException('KhÃƒÆ’Ã‚Â´ng tÃƒÆ’Ã‚Â¬m thÃƒÂ¡Ã‚ÂºÃ‚Â¥y lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch khÃƒÂ¡Ã‚Â»Ã…Â¸i hÃƒÆ’Ã‚Â nh');

    // ChuyÃƒÂ¡Ã‚Â»Ã†â€™n Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i cÃƒÆ’Ã‚Â¡c trÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Âng Decimal sang Number
    return {
      ...schedule,
      hasBookings: schedule.booked_count > 0,
      price: Number(schedule.price),
      tour_schedule_prices: schedule.tour_schedule_prices.map((p) => ({
        ...p,
        price: Number(p.price),
      })),
    };
  }

  private mapScheduleResponse(item: any) {
    if (!item) return null;
    return {
      ...item,
      price: item.price ? Number(item.price) : 0,
      tour_schedule_prices:
        item.tour_schedule_prices?.map((p: any) => ({
          ...p,
          price: p.price ? Number(p.price) : 0,
        })) || [],
    };
  }

  private validatePrice(price: any) {
    const p = Number(price || 0);
    if (p < 0) return 0;
    if (p > 999999999) return 999999999; // ChÃƒÂ¡Ã‚ÂºÃ‚Â·n tÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœi Ãƒâ€žÃ¢â‚¬Ëœa 999 triÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡u Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã†â€™ trÃƒÆ’Ã‚Â¡nh overflow Decimal(12,2)
    return p;
  }

  async createSchedule(tourId: number, body: any) {
    this.requireFields(body, ['start_date', 'end_date', 'price', 'quota']);

    // LÃƒÂ¡Ã‚ÂºÃ‚Â¥y thÃƒÆ’Ã‚Â´ng tin tour gÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœc Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã†â€™ lÃƒÂ¡Ã‚ÂºÃ‚Â¥y mÃƒÆ’Ã‚Â£ code
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: tourId },
      select: { code: true },
    });
    if (!tour) throw new NotFoundException('Tour khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i');

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. TÃƒÂ¡Ã‚ÂºÃ‚Â¡o schedule trÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºc Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã†â€™ lÃƒÂ¡Ã‚ÂºÃ‚Â¥y ID
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

        // 2. CÃƒÂ¡Ã‚ÂºÃ‚Â­p nhÃƒÂ¡Ã‚ÂºÃ‚Â­t mÃƒÆ’Ã‚Â£ code duy nhÃƒÂ¡Ã‚ÂºÃ‚Â¥t (MÃƒÆ’Ã†â€™ GÃƒÂ¡Ã‚Â»Ã‚ÂC - ID)
        const updatedSchedule = await tx.tour_schedules.update({
          where: { tour_schedule_id: schedule.tour_schedule_id },
          data: {
            code: `${tour.code}-${schedule.tour_schedule_id}`,
          },
        });

        // 3. LÃƒâ€ Ã‚Â°u giÃƒÆ’Ã‚Â¡ theo loÃƒÂ¡Ã‚ÂºÃ‚Â¡i khÃƒÆ’Ã‚Â¡ch
        if (
          body.prices &&
          Array.isArray(body.prices) &&
          body.prices.length > 0
        ) {
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

        // 4. LÃƒâ€ Ã‚Â°u lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch trÃƒÆ’Ã‚Â¬nh chi tiÃƒÂ¡Ã‚ÂºÃ‚Â¿t theo ngÃƒÆ’Ã‚Â y
        if (
          body.itinerary &&
          Array.isArray(body.itinerary) &&
          body.itinerary.length > 0
        ) {
          await tx.tour_itineraries.createMany({
            data: body.itinerary.map((it: any, idx: number) => ({
              tour_schedule_id: schedule.tour_schedule_id,
              day_number: it.day_number || idx + 1,
              title: it.title || `NgÃƒÆ’Ã‚Â y ${idx + 1}`,
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
        throw new BadRequestException(
          'ID Tour khÃƒÆ’Ã‚Â´ng hÃƒÂ¡Ã‚Â»Ã‚Â£p lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡ hoÃƒÂ¡Ã‚ÂºÃ‚Â·c dÃƒÂ¡Ã‚Â»Ã‚Â¯ liÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡u liÃƒÆ’Ã‚Âªn quan bÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ lÃƒÂ¡Ã‚Â»Ã¢â‚¬â€i.',
        );
      }
      throw new BadRequestException(
        'LÃƒÂ¡Ã‚Â»Ã¢â‚¬â€i khi tÃƒÂ¡Ã‚ÂºÃ‚Â¡o lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch khÃƒÂ¡Ã‚Â»Ã…Â¸i hÃƒÆ’Ã‚Â nh: ' + error.message,
      );
    }
  }

  async updateSchedule(scheduleId: number, body: any) {
    const existingSchedule = await this.prisma.tour_schedules.findUnique({
      where: { tour_schedule_id: scheduleId },
      include: {
        tours: { select: { name: true } },
        bookings: {
          where: { status: { not: 'cancelled' } },
          select: {
            booking_id: true,
            contact_email: true,
            contact_name: true,
          },
        },
      },
    });

    if (!existingSchedule) {
      throw new NotFoundException('LÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i');
    }

    const now = new Date();
    const startDate = new Date(existingSchedule.start_date);
    const oldStartDate = new Date(existingSchedule.start_date);
    const oldEndDate = new Date(existingSchedule.end_date);
    const hasBookings = existingSchedule.bookings.length > 0;

    if (startDate < now) {
      throw new BadRequestException(
        'KhÃƒÂ´ng thÃ¡Â»Æ’ chÃ¡Â»â€°nh sÃ¡Â»Â­a lÃ¡Â»â€¹ch trÃƒÂ¬nh Ã„â€˜ÃƒÂ£ khÃ¡Â»Å¸i hÃƒÂ nh.',
      );
    }

    if (hasBookings && body.quota !== undefined && body.quota !== null) {
      const newQuota = Number(body.quota);
      if (newQuota < existingSchedule.booked_count) {
        throw new BadRequestException(
          `SÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£ng chÃ¡Â»â€” khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c thÃ¡ÂºÂ¥p hÃ†Â¡n sÃ¡Â»â€˜ khÃƒÂ¡ch Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡ÂºÂ·t (${existingSchedule.booked_count}).`,
        );
      }

      if (
        newQuota !== existingSchedule.quota &&
        newQuota <= existingSchedule.quota
      ) {
        throw new BadRequestException(
          `Khi Ã„â€˜ÃƒÂ£ cÃƒÂ³ khÃƒÂ¡ch Ã„â€˜Ã¡ÂºÂ·t, sÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£ng chÃ¡Â»â€” chÃ¡Â»â€° Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ„Æ’ng lÃ¡Â»â€ºn hÃ†Â¡n mÃ¡Â»Â©c hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i (${existingSchedule.quota}).`,
        );
      }
    }

    const nextStartDate = body.start_date
      ? new Date(body.start_date)
      : oldStartDate;
    const nextEndDate = body.end_date ? new Date(body.end_date) : oldEndDate;
    const shouldNotifyCustomers =
      hasBookings &&
      (nextStartDate.getTime() !== oldStartDate.getTime() ||
        nextEndDate.getTime() !== oldEndDate.getTime());

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

        if (body.prices && Array.isArray(body.prices)) {
          await tx.tour_schedule_prices.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
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

        if (body.itinerary && Array.isArray(body.itinerary)) {
          await tx.tour_itineraries.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
          if (body.itinerary.length > 0) {
            await tx.tour_itineraries.createMany({
              data: body.itinerary.map((it: any, idx: number) => ({
                tour_schedule_id: scheduleId,
                day_number: it.day_number || idx + 1,
                title: it.title || `NgÃƒÂ y ${idx + 1}`,
                content: it.content || it.description || '',
                meals: it.meals || null,
              })),
            });
          }
        }

        return schedule;
      });

      if (shouldNotifyCustomers) {
        await Promise.allSettled(
          existingSchedule.bookings
            .filter((booking) => booking.contact_email)
            .map((booking) =>
              this.mailService.sendScheduleUpdatedEmail({
                email: booking.contact_email,
                contactName: booking.contact_name,
                bookingId: booking.booking_id,
                tourName: existingSchedule.tours?.name || 'Tour',
                oldStartDate,
                newStartDate: nextStartDate,
                oldEndDate,
                newEndDate: nextEndDate,
              }),
            ),
        );
      }

      return {
        ...this.mapScheduleResponse(result),
        notificationSent: shouldNotifyCustomers,
        hasBookings,
      };
    } catch (error) {
      console.error('[Update Schedule Error]', error);
      throw new BadRequestException(
        'LÃ¡Â»â€”i khi cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh: ' + error.message,
      );
    }
  }

  async deleteSchedule(scheduleId: number) {
    const bookingsCount = await this.prisma.bookings.count({
      where: { tour_schedule_id: scheduleId },
    });

    if (bookingsCount > 0) {
      throw new BadRequestException(
        'KhÃƒÆ’Ã‚Â´ng thÃƒÂ¡Ã‚Â»Ã†â€™ xÃƒÆ’Ã‚Â³a lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch trÃƒÆ’Ã‚Â¬nh Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ cÃƒÆ’Ã‚Â³ khÃƒÆ’Ã‚Â¡ch Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â·t.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // XÃƒÆ’Ã‚Â³a cÃƒÆ’Ã‚Â¡c dÃƒÂ¡Ã‚Â»Ã‚Â¯ liÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡u liÃƒÆ’Ã‚Âªn quan trÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºc khi xÃƒÆ’Ã‚Â³a lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch trÃƒÆ’Ã‚Â¬nh
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
      select: { hotel_id: true, name: true, star_rating: true },
    });
  }

  async listHotelRoomTypes(hotelId: number) {
    return this.prisma.hotel_room_types.findMany({
      where: { hotel_id: hotelId },
      select: { room_type_id: true, name: true, base_price: true },
    });
  }

  async listAllTransports() {
    return this.prisma.transports.findMany({
      orderBy: { name: 'asc' },
      select: { transport_id: true, name: true, transport_type: true },
    });
  }
}


