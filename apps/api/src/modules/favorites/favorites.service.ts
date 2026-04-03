import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getMyFavoriteIds(userId: number) {
    const items = await this.prisma.favorites.findMany({
      where: { user_id: userId },
      select: { tour_id: true },
    });

    return {
      items: items.map((item) => item.tour_id),
    };
  }

  async getMyFavorites(userId: number) {
    return this.prisma.favorites.findMany({
      where: { user_id: userId },
      include: {
        tours: {
          include: {
            tour_images: {
              where: { is_cover: 1 },
              take: 1,
            },
            tour_schedules: {
              where: {
                status: 1,
                start_date: { gte: new Date() },
              },
              orderBy: { start_date: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
  }

  async addFavorite(userId: number, tourId: number) {
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: tourId },
      select: { tour_id: true, status: true, name: true },
    });

    if (!tour || tour.status !== 1) {
      throw new NotFoundException(
        'Tour không tồn tại hoặc hiện không mở bán.',
      );
    }

    try {
      await this.prisma.favorites.create({
        data: {
          user_id: userId,
          tour_id: tourId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return {
          success: true,
          action: 'exists',
          tour_id: tourId,
        };
      }
      throw error;
    }

    return {
      success: true,
      action: 'added',
      tour_id: tourId,
    };
  }

  async removeFavorite(userId: number, tourId: number) {
    const existing = await this.prisma.favorites.findUnique({
      where: {
        user_id_tour_id: {
          user_id: userId,
          tour_id: tourId,
        },
      },
    });

    if (!existing) {
      throw new BadRequestException(
        'Tour này chưa có trong danh sách yêu thích.',
      );
    }

    await this.prisma.favorites.delete({
      where: {
        user_id_tour_id: {
          user_id: userId,
          tour_id: tourId,
        },
      },
    });

    return {
      success: true,
      action: 'removed',
      tour_id: tourId,
    };
  }
}
