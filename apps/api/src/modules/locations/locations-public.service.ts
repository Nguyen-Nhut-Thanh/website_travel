import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

type RegionConfig = {
  key: string;
  label: string;
  parentNames: string[];
};

type FeaturedDestinationItem = {
  location_id: number;
  name: string;
  slug: string;
  image_url: string | null;
  alt_text: string;
  total_tours: number;
};

type FeaturedDestinationGroup = {
  key: string;
  label: string;
  items: FeaturedDestinationItem[];
};

@Injectable()
export class LocationsPublicService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly featuredRegions: RegionConfig[] = [
    { key: 'mien-bac', label: 'Miền Bắc', parentNames: ['Miền Bắc'] },
    { key: 'mien-trung', label: 'Miền Trung', parentNames: ['Miền Trung'] },
    {
      key: 'mien-dong-nam-bo',
      label: 'Miền Đông Nam Bộ',
      parentNames: ['Miền Đông Nam Bộ'],
    },
    {
      key: 'mien-tay-nam-bo',
      label: 'Miền Tây Nam Bộ',
      parentNames: ['Miền Tây Nam Bộ'],
    },
    { key: 'chau-a', label: 'Châu Á', parentNames: ['Châu Á'] },
    { key: 'chau-au', label: 'Châu Âu', parentNames: ['Châu Âu'] },
    { key: 'chau-my', label: 'Châu Mỹ', parentNames: ['Châu Mỹ'] },
  ];

  private async getParentIdsByNames(names: string[]) {
    const parents = await this.prisma.locations.findMany({
      where: {
        name: {
          in: names,
        },
      },
      select: {
        location_id: true,
      },
    });

    return parents.map((item) => item.location_id);
  }

  async getFeaturedDestinations(): Promise<{
    regions: FeaturedDestinationGroup[];
  }> {
    // 1. Lấy tất cả các địa điểm được đánh dấu là Featured và có level <= 4 (Các Tab Miền)
    const featuredTabs = await this.prisma.locations.findMany({
      where: {
        is_featured: true,
        level_id: { lte: 4 },
      },
      orderBy: {
        featured_order: 'asc',
      },
    });

    const regions = await Promise.all(
      featuredTabs.map(async (tab) => {
        // 2. Với mỗi Tab, lấy các địa điểm con trực tiếp được đánh dấu là Featured
        const locations = await this.prisma.locations.findMany({
          where: {
            parent_id: tab.location_id,
            is_featured: true,
          },
          orderBy: [{ featured_order: 'asc' }, { name: 'asc' }],
          take: 9,
          select: {
            location_id: true,
            name: true,
            slug: true,
            featured_image: true,
            location_images: {
              where: {
                status: 1,
              },
              orderBy: [
                { is_cover: 'desc' },
                { sort_order: 'asc' },
                { image_id: 'asc' },
              ],
              take: 1,
              select: {
                image_url: true,
                alt_text: true,
              },
            },
            tour_destinations: {
              select: {
                tour_id: true,
              },
            },
          },
        });

        const items: FeaturedDestinationItem[] = locations.map((location) => {
          const firstImage = location.location_images[0];

          return {
            location_id: location.location_id,
            name: location.name,
            slug: location.slug,
            image_url: location.featured_image || firstImage?.image_url || null,
            alt_text: firstImage?.alt_text ?? location.name,
            total_tours: location.tour_destinations.length,
          };
        });

        return {
          key: tab.slug,
          label: tab.name,
          items,
        };
      }),
    );

    // Lọc bỏ các vùng không có item nào nếu cần, hoặc trả về hết
    return { regions };
  }

  async getNavigationData() {
    // 1. Lấy danh sách Miền (level_id = 4)
    const regions = await this.prisma.locations.findMany({
      where: {
        level_id: 4,
        country_code: 'VN',
      },
      select: {
        location_id: true,
        name: true,
        other_locations: {
          where: {
            level_id: 5, // Tỉnh/Thành phố
          },
          select: {
            name: true,
            slug: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        location_id: 'asc',
      },
    });

    // 2. Lấy danh sách Quốc gia (level_id = 3, loại trừ Việt Nam)
    const countries = await this.prisma.locations.findMany({
      where: {
        level_id: 3,
        location_type: 'country',
        NOT: {
          slug: 'viet-nam',
        },
      },
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      domestic: regions.map((r) => ({
        region: r.name,
        cities: r.other_locations,
      })),
      international: countries,
    };
  }
}
