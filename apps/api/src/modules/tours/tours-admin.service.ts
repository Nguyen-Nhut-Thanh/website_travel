import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MailService } from '../mail/mail.service';
import type {
  ScheduleAdminPayload,
  ScheduleItineraryPayload,
  SchedulePricePayload,
  TourAdminPayload,
  TourListParams,
} from './tours.types';

@Injectable()
export class ToursAdminService {
  private readonly logger = new Logger(ToursAdminService.name);

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

  private async getTourWithAdminRelationsOrThrow(id: number) {
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

    return tour;
  }

  private requireFields(body: Record<string, unknown>, fields: string[]) {
    for (const field of fields) {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        throw new BadRequestException(`Missing ${field}`);
      }
    }
  }

  private validatePrice(price: unknown) {
    const numericPrice = Number(price || 0);
    if (numericPrice < 0) return 0;
    if (numericPrice > 999999999) return 999999999;
    return numericPrice;
  }

  private normalizePolicyEntries(policyContents?: Record<string, unknown>) {
    if (!policyContents || typeof policyContents !== 'object') {
      return [];
    }

    return Object.entries(policyContents)
      .map(([policy_type, content]) => {
        const normalizedContent =
          typeof content === 'string'
            ? content
            : content == null
              ? ''
              : JSON.stringify(content);

        return {
          policy_type,
          content: normalizedContent.trim(),
        };
      })
      .filter((entry) => entry.content.length > 0);
  }

  private normalizeDestinationIds(destinations?: Array<number | string>) {
    if (!Array.isArray(destinations)) {
      return [];
    }

    return destinations.map((locationId) => Number(locationId));
  }

  private mapSchedulePrice(price: SchedulePricePayload) {
    return {
      passenger_type: price.passenger_type,
      price: this.validatePrice(price.price),
      currency: price.currency || 'VND',
      note: price.note || null,
    };
  }

  private mapScheduleItinerary(
    itinerary: ScheduleItineraryPayload,
    index: number,
  ) {
    return {
      day_number: itinerary.day_number || index + 1,
      title: itinerary.title || `NgÃ y ${index + 1}`,
      content: itinerary.content || itinerary.description || '',
      meals: itinerary.meals || null,
    };
  }

  private mapScheduleHotel(
    itinerary: ScheduleItineraryPayload,
    index: number,
    scheduleId: number,
  ) {
    const hotelId = Number(itinerary.hotel_id || 0);
    const roomTypeId = Number(itinerary.room_type_id || 0);

    if (!hotelId || !roomTypeId) {
      return null;
    }

    const dayNumber = Number(itinerary.day_number || index + 1);

    return {
      tour_schedule_id: scheduleId,
      hotel_id: hotelId,
      room_type_id: roomTypeId,
      nights: Number(itinerary.nights || 1) || 1,
      day_from: dayNumber,
      day_to: dayNumber,
      note: itinerary.description || itinerary.content || null,
    };
  }

  private mapScheduleResponse(
    schedule: {
      price?: unknown;
      tour_schedule_prices?: Array<
        { price?: unknown } & Record<string, unknown>
      >;
    } | null,
  ) {
    if (!schedule) return null;

    return {
      ...schedule,
      price: schedule.price ? Number(schedule.price) : 0,
      tour_schedule_prices:
        schedule.tour_schedule_prices?.map((price) => ({
          ...price,
          price: price.price ? Number(price.price) : 0,
        })) || [],
    };
  }

  private async countTourBookings(scheduleIds: number[]) {
    if (scheduleIds.length === 0) {
      return 0;
    }

    return this.prisma.bookings.count({
      where: { tour_schedule_id: { in: scheduleIds } },
    });
  }

  private ensureMutableFieldChangeAllowed(
    field: string,
    oldValue: unknown,
    newValue: unknown,
    totalBookings: number,
  ) {
    const normalizeComparableValue = (value: unknown) =>
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
        ? String(value)
        : value == null
          ? ''
          : JSON.stringify(value);

    if (
      newValue !== undefined &&
      newValue !== null &&
      normalizeComparableValue(newValue) !== normalizeComparableValue(oldValue)
    ) {
      throw new BadRequestException(
        `KhÃ´ng thá»ƒ thay Ä‘á»•i trÆ°á»ng '${field}' vÃ¬ tour nÃ y Ä‘Ã£ cÃ³ ${totalBookings} booking.`,
      );
    }
  }

  async detail(id: number) {
    const tour = await this.getTourWithAdminRelationsOrThrow(id);
    return { tour };
  }

  async list(params: TourListParams) {
    const where: Record<string, unknown> = {};

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

  async create(body: TourAdminPayload) {
    this.requireFields(body as Record<string, unknown>, [
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

        const policyEntries = this.normalizePolicyEntries(body.policy_contents);
        if (policyEntries.length > 0) {
          await tx.tour_policies.createMany({
            data: policyEntries.map((entry) => ({
              tour_id: tour.tour_id,
              policy_type: entry.policy_type,
              content: entry.content,
            })),
          });
        }

        const destinationIds = this.normalizeDestinationIds(body.destinations);
        if (destinationIds.length > 0) {
          await tx.tour_destinations.createMany({
            data: destinationIds.map((locationId, index) => ({
              tour_id: tour.tour_id,
              location_id: locationId,
              visit_order: index + 1,
            })),
          });
        }

        if (Array.isArray(body.images) && body.images.length > 0) {
          await tx.tour_images.createMany({
            data: body.images.map((url, index) => ({
              tour_id: tour.tour_id,
              image_url: url,
              is_cover: index === 0 ? 1 : 0,
              sort_order: index + 1,
            })),
          });
        }

        return tour;
      });
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2002') {
        throw new BadRequestException(
          'MÃ£ tour Ä‘Ã£ tá»“n táº¡i trÃªn há»‡ thá»‘ng.',
        );
      }
      if (prismaError.code === 'P2003') {
        throw new BadRequestException(
          'Äiá»ƒm khá»Ÿi hÃ nh hoáº·c phÆ°Æ¡ng tiá»‡n khÃ´ng há»£p lá»‡.',
        );
      }
      throw error;
    }
  }

  async update(id: number, body: TourAdminPayload) {
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
      throw new NotFoundException('Tour khÃ´ng tá»“n táº¡i');
    }

    const scheduleIds = tour.tour_schedules.map(
      (schedule) => schedule.tour_schedule_id,
    );
    const totalBookings = await this.countTourBookings(scheduleIds);

    if (totalBookings > 0) {
      const lockedFields: Array<keyof TourAdminPayload> = [
        'code',
        'name',
        'duration_days',
        'duration_nights',
        'tour_type',
        'departure_location',
      ];

      for (const field of lockedFields) {
        this.ensureMutableFieldChangeAllowed(
          field,
          tour[field as keyof typeof tour],
          body[field],
          totalBookings,
        );
      }

      if (Array.isArray(body.destinations)) {
        const currentDestinations = tour.tour_destinations
          .map((item) => item.location_id)
          .sort((a, b) => a - b);
        const nextDestinations = this.normalizeDestinationIds(
          body.destinations,
        ).sort((a, b) => a - b);

        const destinationsChanged =
          currentDestinations.length !== nextDestinations.length ||
          currentDestinations.some(
            (value, index) => value !== nextDestinations[index],
          );

        if (destinationsChanged) {
          throw new BadRequestException(
            'KhÃ´ng thá»ƒ thay Ä‘á»•i danh sÃ¡ch Ä‘iá»ƒm Ä‘áº¿n vÃ¬ tour nÃ y Ä‘Ã£ cÃ³ booking.',
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

          const policyEntries = this.normalizePolicyEntries(
            body.policy_contents,
          );
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

        if (Array.isArray(body.destinations)) {
          const destinationIds = this.normalizeDestinationIds(
            body.destinations,
          );
          await tx.tour_destinations.deleteMany({ where: { tour_id: id } });
          await tx.tour_destinations.createMany({
            data: destinationIds.map((locationId, index) => ({
              tour_id: id,
              location_id: locationId,
              visit_order: index + 1,
            })),
          });
        }

        if (Array.isArray(body.images)) {
          await tx.tour_images.deleteMany({ where: { tour_id: id } });
          await tx.tour_images.createMany({
            data: body.images.map((url, index) => ({
              tour_id: id,
              image_url: url,
              is_cover: index === 0 ? 1 : 0,
              sort_order: index + 1,
            })),
          });
        }

        return updatedTour;
      });
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2002') {
        throw new BadRequestException(
          'MÃ£ tour Ä‘Ã£ tá»“n táº¡i trÃªn há»‡ thá»‘ng.',
        );
      }
      if (prismaError.code === 'P2003') {
        throw new BadRequestException(
          'ThÃ´ng tin Ä‘iá»ƒm Ä‘áº¿n hoáº·c phÆ°Æ¡ng tiá»‡n khÃ´ng há»£p lá»‡.',
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
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour khÃ´ng tá»“n táº¡i');
    }

    const scheduleIds = tour.tour_schedules.map(
      (schedule) => schedule.tour_schedule_id,
    );
    const bookingsCount = await this.countTourBookings(scheduleIds);

    if (bookingsCount > 0) {
      throw new BadRequestException(
        'KhÃ´ng thá»ƒ xÃ³a tour vÃ¬ Ä‘Ã£ cÃ³ lá»‹ch khá»Ÿi hÃ nh phÃ¡t sinh booking.',
      );
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

      await tx.favorites.deleteMany({ where: { tour_id: id } });
      await tx.reviews.deleteMany({ where: { tour_id: id } });
      await tx.tour_destinations.deleteMany({ where: { tour_id: id } });
      await tx.tour_images.deleteMany({ where: { tour_id: id } });
      await tx.tour_policies.deleteMany({ where: { tour_id: id } });

      return tx.tours.delete({
        where: { tour_id: id },
      });
    });
  }

  async listSchedules(tourId: number) {
    const items = await this.prisma.tour_schedules.findMany({
      where: { tour_id: tourId },
      orderBy: { start_date: 'asc' },
      include: {
        _count: { select: { bookings: true } },
      },
    });

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
        tour_schedule_hotels: {
          include: { hotels: true, hotel_room_types: true },
        },
        tour_itineraries: { orderBy: { day_number: 'asc' } },
      },
    });

    if (!schedule) {
      throw new NotFoundException('KhÃ´ng tÃ¬m tháº¥y lá»‹ch khá»Ÿi hÃ nh');
    }

    return {
      ...schedule,
      hasBookings: schedule.booked_count > 0,
      price: Number(schedule.price),
      tour_schedule_prices: schedule.tour_schedule_prices.map((price) => ({
        ...price,
        price: Number(price.price),
      })),
      tour_schedule_hotels: schedule.tour_schedule_hotels.map((item) => ({
        ...item,
        nights: Number(item.nights || 1),
        day_from: item.day_from ?? null,
        day_to: item.day_to ?? null,
        hotel_id: Number(item.hotel_id),
        room_type_id: Number(item.room_type_id),
        hotel_room_types: item.hotel_room_types
          ? {
              ...item.hotel_room_types,
              base_price: Number(item.hotel_room_types.base_price ?? 0),
            }
          : null,
      })),
    };
  }

  async createSchedule(tourId: number, body: ScheduleAdminPayload) {
    this.requireFields(body as Record<string, unknown>, [
      'start_date',
      'end_date',
      'price',
      'quota',
    ]);

    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: tourId },
      select: { code: true },
    });

    if (!tour) {
      throw new NotFoundException('Tour khÃ´ng tá»“n táº¡i');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const schedule = await tx.tour_schedules.create({
          data: {
            tour_id: tourId,
            start_date: new Date(body.start_date!),
            end_date: new Date(body.end_date!),
            price: this.validatePrice(body.price),
            quota: Number(body.quota),
            status: body.status != null ? Number(body.status) : 1,
            cover_image_url: body.cover_image_url || null,
          },
        });

        const updatedSchedule = await tx.tour_schedules.update({
          where: { tour_schedule_id: schedule.tour_schedule_id },
          data: {
            code: `${tour.code}-${schedule.tour_schedule_id}`,
          },
        });

        if (Array.isArray(body.prices) && body.prices.length > 0) {
          await tx.tour_schedule_prices.createMany({
            data: body.prices.map((price) => ({
              tour_schedule_id: schedule.tour_schedule_id,
              ...this.mapSchedulePrice(price),
            })),
          });
        }

        if (Array.isArray(body.itinerary) && body.itinerary.length > 0) {
          await tx.tour_itineraries.createMany({
            data: body.itinerary.map((itinerary, index) => ({
              tour_schedule_id: schedule.tour_schedule_id,
              ...this.mapScheduleItinerary(itinerary, index),
            })),
          });

          const hotelEntries = body.itinerary
            .map((itinerary, index) =>
              this.mapScheduleHotel(
                itinerary,
                index,
                schedule.tour_schedule_id,
              ),
            )
            .filter(
              (
                item,
              ): item is {
                tour_schedule_id: number;
                hotel_id: number;
                room_type_id: number;
                nights: number;
                day_from: number;
                day_to: number;
                note: string | null;
              } => item !== null,
            );

          if (hotelEntries.length > 0) {
            await tx.tour_schedule_hotels.createMany({
              data: hotelEntries,
            });
          }
        }

        return updatedSchedule;
      });

      return this.mapScheduleResponse(result);
    } catch (error) {
      this.logger.error('[Create Schedule Error]', error);
      const prismaError = error as { code?: string; message?: string };
      if (prismaError.code === 'P2003') {
        throw new BadRequestException(
          'ID tour khÃ´ng há»£p lá»‡ hoáº·c dá»¯ liá»‡u liÃªn quan bá»‹ lá»—i.',
        );
      }
      throw new BadRequestException(
        `Lá»—i khi táº¡o lá»‹ch khá»Ÿi hÃ nh: ${prismaError.message}`,
      );
    }
  }

  async updateSchedule(scheduleId: number, body: ScheduleAdminPayload) {
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
      throw new NotFoundException('Lá»‹ch khá»Ÿi hÃ nh khÃ´ng tá»“n táº¡i');
    }

    const now = new Date();
    const oldStartDate = new Date(existingSchedule.start_date);
    const oldEndDate = new Date(existingSchedule.end_date);
    const hasBookings = existingSchedule.bookings.length > 0;

    if (oldStartDate < now) {
      throw new BadRequestException(
        'KhÃ´ng thá»ƒ chá»‰nh sá»­a lá»‹ch trÃ¬nh Ä‘Ã£ khá»Ÿi hÃ nh.',
      );
    }

    if (hasBookings && body.quota !== undefined && body.quota !== null) {
      const newQuota = Number(body.quota);
      if (newQuota < existingSchedule.booked_count) {
        throw new BadRequestException(
          `Sá»‘ lÆ°á»£ng chá»— khÃ´ng Ä‘Æ°á»£c tháº¥p hÆ¡n sá»‘ khÃ¡ch Ä‘Ã£ Ä‘áº·t (${existingSchedule.booked_count}).`,
        );
      }

      if (
        newQuota !== existingSchedule.quota &&
        newQuota <= existingSchedule.quota
      ) {
        throw new BadRequestException(
          `Khi Ä‘Ã£ cÃ³ khÃ¡ch Ä‘áº·t, sá»‘ lÆ°á»£ng chá»— chá»‰ Ä‘Æ°á»£c tÄƒng lÃªn hÆ¡n má»©c hiá»‡n táº¡i (${existingSchedule.quota}).`,
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
            price:
              body.price != null ? this.validatePrice(body.price) : undefined,
            quota: body.quota != null ? Number(body.quota) : undefined,
            status: body.status != null ? Number(body.status) : undefined,
            cover_image_url: body.cover_image_url ?? undefined,
          },
        });

        if (Array.isArray(body.prices)) {
          await tx.tour_schedule_prices.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
          if (body.prices.length > 0) {
            await tx.tour_schedule_prices.createMany({
              data: body.prices.map((price) => ({
                tour_schedule_id: scheduleId,
                ...this.mapSchedulePrice(price),
              })),
            });
          }
        }

        if (Array.isArray(body.itinerary)) {
          await tx.tour_itineraries.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
          await tx.tour_schedule_hotels.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
          if (body.itinerary.length > 0) {
            await tx.tour_itineraries.createMany({
              data: body.itinerary.map((itinerary, index) => ({
                tour_schedule_id: scheduleId,
                ...this.mapScheduleItinerary(itinerary, index),
              })),
            });

            const hotelEntries = body.itinerary
              .map((itinerary, index) =>
                this.mapScheduleHotel(itinerary, index, scheduleId),
              )
              .filter(
                (
                  item,
                ): item is {
                  tour_schedule_id: number;
                  hotel_id: number;
                  room_type_id: number;
                  nights: number;
                  day_from: number;
                  day_to: number;
                  note: string | null;
                } => item !== null,
              );

            if (hotelEntries.length > 0) {
              await tx.tour_schedule_hotels.createMany({
                data: hotelEntries,
              });
            }
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
      this.logger.error('[Update Schedule Error]', error);
      const updateError = error as Error;
      throw new BadRequestException(
        `Lá»—i khi cáº­p nháº­t lá»‹ch khá»Ÿi hÃ nh: ${updateError.message}`,
      );
    }
  }

  async deleteSchedule(scheduleId: number) {
    const bookingsCount = await this.prisma.bookings.count({
      where: { tour_schedule_id: scheduleId },
    });

    if (bookingsCount > 0) {
      throw new BadRequestException(
        'KhÃ´ng thá»ƒ xÃ³a lá»‹ch trÃ¬nh Ä‘Ã£ cÃ³ khÃ¡ch Ä‘áº·t.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
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
