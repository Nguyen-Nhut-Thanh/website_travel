import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class LocationsAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { search?: string; level_id?: string }) {
    const where: any = {};
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
        locations: { select: { name: true } }, // parent name
        location_images: {
          where: { is_cover: 1 },
          take: 1
        }
      }
    });

    return { items };
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) return null; // Trả về null nếu ID không hợp lệ (ví dụ: "new")

    const item = await this.prisma.locations.findUnique({
      where: { location_id: id },
      include: { 
        geographic_levels: true, 
        locations: true,
        location_images: {
          where: { is_cover: 1 },
          take: 1
        }
      }
    });
    if (!item) throw new NotFoundException('Location not found');
    
    // Gán tạm image_url vào object trả về để frontend dễ dùng
    return {
      ...item,
      image_url: item.location_images?.[0]?.image_url || null
    };
  }

  async listByLevel(levelId: number, parentId?: number) {
    return this.prisma.locations.findMany({
      where: {
        level_id: levelId,
        parent_id: parentId !== undefined ? parentId : undefined
      },
      orderBy: { name: 'asc' },
      select: { location_id: true, name: true, level_id: true, country_code: true }
    });
  }

  async listLevels() {
    return this.prisma.geographic_levels.findMany({
      orderBy: { level_id: 'asc' }
    });
  }

  async listParents() {
    return this.prisma.locations.findMany({
      where: {
        level_id: {
          lt: 7 // Only locations that can be parents
        }
      },
      orderBy: { name: 'asc' },
      select: { location_id: true, name: true, level_id: true }
    });
  }

  private async validateHierarchy(levelId: number, parentId?: number) {
    if (levelId < 3 || levelId > 7) {
      throw new BadRequestException('Cấp độ địa điểm không hợp lệ hoặc nằm ngoài phạm vi hỗ trợ (3-7).');
    }

    if (levelId === 3) {
      if (parentId) throw new BadRequestException('Quốc gia (Cấp 3) không được có địa điểm cha.');
      return;
    }

    if (!parentId) {
      throw new BadRequestException(`Cấp độ ${levelId} bắt buộc phải có địa điểm cha.`);
    }

    const parent = await this.prisma.locations.findUnique({
      where: { location_id: parentId }
    });

    if (!parent) {
      throw new BadRequestException('Địa điểm cha không tồn tại.');
    }

    if (parent.level_id !== levelId - 1) {
      throw new BadRequestException(`Địa điểm cha phải thuộc cấp độ ${levelId - 1}.`);
    }
  }

  async create(body: any) {
    const levelId = Number(body.level_id);
    const parentId = body.parent_id ? Number(body.parent_id) : null;

    await this.validateHierarchy(levelId, parentId || undefined);

    return this.prisma.$transaction(async (tx) => {
      const location = await tx.locations.create({
        data: {
          name: body.name,
          slug: body.slug || body.name.toLowerCase().replace(/ /g, '-'),
          location_type: body.location_type || 'city_destination',
          level_id: levelId,
          parent_id: parentId,
          country_code: body.country_code || null,
          note: body.note || null
        }
      });

      if (body.image_url) {
        await tx.location_images.create({
          data: {
            location_id: location.location_id,
            image_url: body.image_url,
            is_cover: 1,
            sort_order: 1
          }
        });
      }

      return location;
    });
  }

  async update(id: number, body: any) {
    if (body.level_id || body.parent_id !== undefined) {
      const current = await this.prisma.locations.findUnique({ where: { location_id: id } });
      if (!current) throw new NotFoundException('Không tìm thấy địa điểm để cập nhật');

      const levelId = body.level_id ? Number(body.level_id) : current.level_id;
      const parentId = body.parent_id !== undefined 
        ? (body.parent_id ? Number(body.parent_id) : null) 
        : current.parent_id;
      
      await this.validateHierarchy(levelId, parentId || undefined);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedLocation = await tx.locations.update({
        where: { location_id: id },
        data: {
          name: body.name ?? undefined,
          slug: body.slug ?? undefined,
          location_type: body.location_type ?? undefined,
          level_id: body.level_id ? Number(body.level_id) : undefined,
          parent_id: body.parent_id !== undefined ? (body.parent_id ? Number(body.parent_id) : null) : undefined,
          country_code: body.country_code ?? undefined,
          note: body.note ?? undefined,
          is_featured: body.is_featured ?? undefined,
          featured_order: body.featured_order !== undefined ? (body.featured_order ? Number(body.featured_order) : null) : undefined,
          featured_image: body.featured_image ?? undefined
        }
      });

      if (body.image_url !== undefined) {
        await tx.location_images.deleteMany({ where: { location_id: id, is_cover: 1 } });
        if (body.image_url) {
          await tx.location_images.create({
            data: {
              location_id: id,
              image_url: body.image_url,
              is_cover: 1,
              sort_order: 1
            }
          });
        }
      }

      return updatedLocation;
    });
  }

  async remove(id: number) {
    return this.prisma.locations.delete({
      where: { location_id: id }
    });
  }

  async getFeatured() {
    return this.prisma.locations.findMany({
      where: { is_featured: true },
      orderBy: { featured_order: 'asc' },
      include: {
        geographic_levels: true
      }
    });
  }
}
