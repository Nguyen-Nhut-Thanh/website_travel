import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import type { LocationAdminPayload, LocationListParams } from './locations.types';

type LocationUsageSummary = {
  child_locations_count: number;
  destination_tours_count: number;
  departure_tours_count: number;
  hotel_count: number;
  destination_detail_count: number;
  is_used_in_tours: boolean;
  has_children: boolean;
  has_dependencies: boolean;
  can_delete: boolean;
  can_change_structure: boolean;
};

@Injectable()
export class LocationsAdminService {
  constructor(private readonly prisma: PrismaService) {}

  private async getLocationUsageSummary(
    locationId: number,
    db: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<LocationUsageSummary> {
    const [
      child_locations_count,
      destination_tours_count,
      departure_tours_count,
      hotel_count,
      destination_detail_count,
    ] = await Promise.all([
      db.locations.count({ where: { parent_id: locationId } }),
      db.tour_destinations.count({ where: { location_id: locationId } }),
      db.tours.count({ where: { departure_location: locationId } }),
      db.hotels.count({ where: { location_id: locationId } }),
      db.destinations_detail.count({ where: { location_id: locationId } }),
    ]);

    const has_children = child_locations_count > 0;
    const is_used_in_tours =
      destination_tours_count > 0 || departure_tours_count > 0;
    const has_dependencies =
      has_children ||
      is_used_in_tours ||
      hotel_count > 0 ||
      destination_detail_count > 0;

    return {
      child_locations_count,
      destination_tours_count,
      departure_tours_count,
      hotel_count,
      destination_detail_count,
      is_used_in_tours,
      has_children,
      has_dependencies,
      can_delete: !has_dependencies,
      can_change_structure:
        !has_children && !is_used_in_tours && hotel_count === 0,
    };
  }

  private buildDeleteBlockedMessage(
    locationName: string,
    usage: LocationUsageSummary,
  ) {
    const reasons: string[] = [];

    if (usage.child_locations_count > 0) {
      reasons.push(`${usage.child_locations_count} địa điểm con`);
    }
    if (usage.destination_tours_count > 0) {
      reasons.push(`${usage.destination_tours_count} tour dùng làm điểm đến`);
    }
    if (usage.departure_tours_count > 0) {
      reasons.push(
        `${usage.departure_tours_count} tour dùng làm điểm khởi hành`,
      );
    }
    if (usage.hotel_count > 0) {
      reasons.push(`${usage.hotel_count} khách sạn liên kết`);
    }
    if (usage.destination_detail_count > 0) {
      reasons.push(`${usage.destination_detail_count} hồ sơ chi tiết`);
    }

    return `Không thể xóa địa điểm "${locationName}" vì còn liên kết dữ liệu: ${reasons.join(', ')}.`;
  }

  private buildStructureLockedMessage(
    locationName: string,
    usage: LocationUsageSummary,
  ) {
    const reasons: string[] = [];

    if (usage.child_locations_count > 0) {
      reasons.push('đang có địa điểm con');
    }
    if (usage.destination_tours_count > 0 || usage.departure_tours_count > 0) {
      reasons.push('đang được tour sử dụng');
    }
    if (usage.hotel_count > 0) {
      reasons.push('đang có khách sạn liên kết');
    }

    return `Không thể thay đổi cấu trúc của địa điểm "${locationName}" vì ${reasons.join(', ')}. Bạn vẫn có thể cập nhật tên, mô tả, ảnh và trạng thái nổi bật.`;
  }

  private createSlug(name?: string) {
    return (name || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  async findAll(params: LocationListParams) {
    const where: Record<string, unknown> = {};
    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (params.level_id) {
      where.level_id = Number(params.level_id);
    }

    const items = await this.prisma.locations.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        geographic_levels: true,
        locations: { select: { name: true } },
        location_images: {
          where: { is_cover: 1 },
          take: 1,
        },
      },
    });

    return { items };
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      return null;
    }

    const item = await this.prisma.locations.findUnique({
      where: { location_id: id },
      include: {
        geographic_levels: true,
        locations: true,
        location_images: {
          where: { is_cover: 1 },
          take: 1,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Location not found');
    }

    const usage_summary = await this.getLocationUsageSummary(id);

    return {
      ...item,
      image_url: item.location_images?.[0]?.image_url || null,
      usage_summary,
    };
  }

  async listByLevel(levelId: number, parentId?: number) {
    return this.prisma.locations.findMany({
      where: {
        level_id: levelId,
        parent_id: parentId !== undefined ? parentId : undefined,
      },
      orderBy: { name: 'asc' },
      select: {
        location_id: true,
        name: true,
        level_id: true,
        country_code: true,
      },
    });
  }

  async listLevels() {
    return this.prisma.geographic_levels.findMany({
      orderBy: { level_id: 'asc' },
    });
  }

  async listParents() {
    return this.prisma.locations.findMany({
      where: {
        level_id: {
          lt: 7,
        },
      },
      orderBy: { name: 'asc' },
      select: { location_id: true, name: true, level_id: true },
    });
  }

  private async validateHierarchy(levelId: number, parentId?: number | null) {
    if (levelId < 3 || levelId > 7) {
      throw new BadRequestException(
        'Cấp độ địa điểm không hợp lệ hoặc nằm ngoài phạm vi hỗ trợ (3-7).',
      );
    }

    if (levelId === 3) {
      if (parentId) {
        throw new BadRequestException(
          'Quốc gia (cấp 3) không được có địa điểm cha.',
        );
      }
      return;
    }

    if (!parentId) {
      throw new BadRequestException(
        `Cấp độ ${levelId} bắt buộc phải có địa điểm cha.`,
      );
    }

    const parent = await this.prisma.locations.findUnique({
      where: { location_id: parentId },
    });

    if (!parent) {
      throw new BadRequestException('Địa điểm cha không tồn tại.');
    }

    if (parent.level_id !== levelId - 1) {
      throw new BadRequestException(
        `Địa điểm cha phải thuộc cấp độ ${levelId - 1}.`,
      );
    }
  }

  async create(body: LocationAdminPayload) {
    const levelId = Number(body.level_id);
    const parentId = body.parent_id ? Number(body.parent_id) : null;

    await this.validateHierarchy(levelId, parentId);

    return this.prisma.$transaction(async (tx) => {
      const name = String(body.name || '').trim();
      const location = await tx.locations.create({
        data: {
          name,
          slug: body.slug || this.createSlug(name),
          location_type: body.location_type || 'city_destination',
          level_id: levelId,
          parent_id: parentId,
          country_code: body.country_code || null,
          note: body.note || null,
        },
      });

      if (body.image_url) {
        await tx.location_images.create({
          data: {
            location_id: location.location_id,
            image_url: body.image_url,
            is_cover: 1,
            sort_order: 1,
          },
        });
      }

      return location;
    });
  }

  async update(id: number, body: LocationAdminPayload) {
    const current = await this.prisma.locations.findUnique({
      where: { location_id: id },
    });

    if (!current) {
      throw new NotFoundException('Không tìm thấy địa điểm để cập nhật');
    }

    const nextLevelId = body.level_id ? Number(body.level_id) : current.level_id;
    const nextParentId =
      body.parent_id !== undefined
        ? body.parent_id
          ? Number(body.parent_id)
          : null
        : current.parent_id;
    const nextCountryCode =
      body.country_code !== undefined
        ? body.country_code || null
        : current.country_code;
    const nextLocationType =
      body.location_type !== undefined
        ? body.location_type
        : current.location_type;

    const hasStructuralChange =
      nextLevelId !== current.level_id ||
      nextParentId !== current.parent_id ||
      nextCountryCode !== current.country_code ||
      nextLocationType !== current.location_type;

    if (hasStructuralChange) {
      const usage = await this.getLocationUsageSummary(id);
      if (!usage.can_change_structure) {
        throw new BadRequestException(
          this.buildStructureLockedMessage(current.name, usage),
        );
      }
    }

    if (body.level_id || body.parent_id !== undefined) {
      await this.validateHierarchy(nextLevelId, nextParentId);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedLocation = await tx.locations.update({
        where: { location_id: id },
        data: {
          name: body.name ?? undefined,
          slug: body.slug ?? undefined,
          location_type: body.location_type ?? undefined,
          level_id: body.level_id ? Number(body.level_id) : undefined,
          parent_id:
            body.parent_id !== undefined
              ? body.parent_id
                ? Number(body.parent_id)
                : null
              : undefined,
          country_code:
            body.country_code !== undefined ? body.country_code : undefined,
          note: body.note ?? undefined,
          is_featured: body.is_featured ?? undefined,
          featured_order:
            body.featured_order !== undefined
              ? body.featured_order
                ? Number(body.featured_order)
                : null
              : undefined,
          featured_image: body.featured_image ?? undefined,
        },
      });

      if (body.image_url !== undefined) {
        await tx.location_images.deleteMany({
          where: { location_id: id, is_cover: 1 },
        });
        if (body.image_url) {
          await tx.location_images.create({
            data: {
              location_id: id,
              image_url: body.image_url,
              is_cover: 1,
              sort_order: 1,
            },
          });
        }
      }

      return updatedLocation;
    });
  }

  async remove(id: number) {
    const location = await this.prisma.locations.findUnique({
      where: { location_id: id },
      select: {
        location_id: true,
        name: true,
      },
    });

    if (!location) {
      throw new NotFoundException('Không tìm thấy địa điểm để xóa');
    }

    const usage = await this.getLocationUsageSummary(id);
    if (!usage.can_delete) {
      throw new BadRequestException(
        this.buildDeleteBlockedMessage(location.name, usage),
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.destinations_detail.deleteMany({
        where: { location_id: id },
      });

      return tx.locations.delete({
        where: { location_id: id },
      });
    });
  }

  async getFeatured() {
    return this.prisma.locations.findMany({
      where: { is_featured: true },
      orderBy: { featured_order: 'asc' },
      include: {
        geographic_levels: true,
      },
    });
  }
}
