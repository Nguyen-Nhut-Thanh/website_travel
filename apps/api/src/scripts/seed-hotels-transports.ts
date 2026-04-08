import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';

const envCandidates = [
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '..', '..', '..', '.env'),
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath, override: false, quiet: true });
}

if (!process.env.DATABASE_URL) {
  console.error('Thiếu biến môi trường DATABASE_URL.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool as any),
});

type HotelSeed = {
  name: string;
  starRating: number;
  address: string;
  phone: string;
  email: string;
  description: string;
  singleRoomPrice: number;
};

type ProviderSeed = {
  name: string;
  type: string;
  contactInfo: string;
};

type TransportSeed = {
  name: string;
  type: 'airplane' | 'bus';
  capacity: number;
  providerName: string;
  description: string;
};

const hotelSeeds: HotelSeed[] = [
  {
    name: 'Khách sạn Sunrise Đà Nẵng',
    starRating: 4,
    address: '12 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
    phone: '0901000001',
    email: 'sunrise.danang@example.com',
    description: 'Khách sạn gần biển, phù hợp tour gia đình.',
    singleRoomPrice: 850000,
  },
  {
    name: 'Khách sạn Lotus Huế Riverside',
    starRating: 3,
    address: '88 Lê Lợi, Phú Hội, Huế',
    phone: '0901000002',
    email: 'lotus.hue@example.com',
    description: 'Khách sạn trung tâm gần sông Hương.',
    singleRoomPrice: 620000,
  },
  {
    name: 'Khách sạn Saigon Pearl',
    starRating: 4,
    address: '25 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '0901000003',
    email: 'saigon.pearl@example.com',
    description: 'Vị trí trung tâm, dễ dàng kết nối điểm tham quan.',
    singleRoomPrice: 980000,
  },
  {
    name: 'Khách sạn Hà Nội Old Quarter',
    starRating: 3,
    address: '7 Hàng Bạc, Hoàn Kiếm, Hà Nội',
    phone: '0901000004',
    email: 'hanoi.oldquarter@example.com',
    description: 'Khách sạn phố cổ, phòng gọn gàng sạch sẽ.',
    singleRoomPrice: 700000,
  },
  {
    name: 'Khách sạn Nha Trang Ocean View',
    starRating: 4,
    address: '41 Trần Phú, Nha Trang',
    phone: '0901000005',
    email: 'nhatrang.ocean@example.com',
    description: 'Hướng biển, tiện nghi cho đoàn nhỏ.',
    singleRoomPrice: 890000,
  },
  {
    name: 'Khách sạn Đà Lạt Pine Hill',
    starRating: 3,
    address: '16 Trần Hưng Đạo, Đà Lạt',
    phone: '0901000006',
    email: 'dalat.pinehill@example.com',
    description: 'Không gian yên tĩnh, phù hợp nghỉ dưỡng.',
    singleRoomPrice: 760000,
  },
  {
    name: 'Khách sạn Cần Thơ Riverside',
    starRating: 3,
    address: '99 Hai Bà Trưng, Ninh Kiều, Cần Thơ',
    phone: '0901000007',
    email: 'cantho.river@example.com',
    description: 'Gần bến Ninh Kiều, thuận tiện tham quan chợ nổi.',
    singleRoomPrice: 650000,
  },
  {
    name: 'Khách sạn Phú Quốc Coral Bay',
    starRating: 4,
    address: '2 Trần Hưng Đạo, Dương Đông, Phú Quốc',
    phone: '0901000008',
    email: 'phuquoc.coral@example.com',
    description: 'Gần bãi biển, dịch vụ phù hợp tour biển đảo.',
    singleRoomPrice: 1150000,
  },
  {
    name: 'Khách sạn Quy Nhơn Seaside',
    starRating: 3,
    address: '77 An Dương Vương, Quy Nhơn',
    phone: '0901000009',
    email: 'quynhon.seaside@example.com',
    description: 'Giá hợp lý, phòng đơn phù hợp khách lẻ.',
    singleRoomPrice: 680000,
  },
  {
    name: 'Khách sạn Vũng Tàu Lighthouse',
    starRating: 3,
    address: '18 Hạ Long, Vũng Tàu',
    phone: '0901000010',
    email: 'vungtau.lighthouse@example.com',
    description: 'Gần bãi trước, thông thoáng và dễ di chuyển.',
    singleRoomPrice: 720000,
  },
];

const providerSeeds: ProviderSeed[] = [
  {
    name: 'Vietnam Airlines',
    type: 'airline',
    contactInfo: '1900 1100',
  },
  {
    name: 'Vietjet Air',
    type: 'airline',
    contactInfo: '1900 1886',
  },
  {
    name: 'Bamboo Airways',
    type: 'airline',
    contactInfo: '1900 1166',
  },
  {
    name: 'FUTA Bus Lines',
    type: 'bus',
    contactInfo: '1900 6067',
  },
  {
    name: 'Phuong Trang Limousine',
    type: 'bus',
    contactInfo: '1900 6767',
  },
  {
    name: 'Thanh Buoi Express',
    type: 'bus',
    contactInfo: '1900 6079',
  },
];

const transportSeeds: TransportSeed[] = [
  {
    name: 'Vietnam Airlines A321 (Nội địa)',
    type: 'airplane',
    capacity: 180,
    providerName: 'Vietnam Airlines',
    description: 'Chuyến bay nội địa, khoang phổ thông.',
  },
  {
    name: 'Vietnam Airlines ATR72 (Vùng miền)',
    type: 'airplane',
    capacity: 68,
    providerName: 'Vietnam Airlines',
    description: 'Đường bay ngắn đến các điểm du lịch.',
  },
  {
    name: 'Vietjet Air A320 (Tiết kiệm)',
    type: 'airplane',
    capacity: 180,
    providerName: 'Vietjet Air',
    description: 'Phù hợp các tour giá linh hoạt.',
  },
  {
    name: 'Vietjet Air A321 (Lớn)',
    type: 'airplane',
    capacity: 220,
    providerName: 'Vietjet Air',
    description: 'Công suất lớn cho đoàn đông.',
  },
  {
    name: 'Bamboo Airways B787 (Thoải mái)',
    type: 'airplane',
    capacity: 294,
    providerName: 'Bamboo Airways',
    description: 'Dòng máy bay rộng cho hành trình dài.',
  },
  {
    name: 'Bamboo Airways A321 (Linh hoạt)',
    type: 'airplane',
    capacity: 184,
    providerName: 'Bamboo Airways',
    description: 'Linh hoạt cho các chặng nội địa.',
  },
  {
    name: 'Phương Trang - Xe giường nằm 34 chỗ',
    type: 'bus',
    capacity: 34,
    providerName: 'FUTA Bus Lines',
    description: 'Xe giường nằm 34 chỗ, hợp tuyến đêm.',
  },
  {
    name: 'Phương Trang - Xe ghế ngồi 45 chỗ',
    type: 'bus',
    capacity: 45,
    providerName: 'FUTA Bus Lines',
    description: 'Xe ghế ngồi 45 chỗ, phù hợp đoàn vừa.',
  },
  {
    name: 'Phương Trang Limousine 16 chỗ',
    type: 'bus',
    capacity: 16,
    providerName: 'Phuong Trang Limousine',
    description: 'Xe limousine nhỏ cho nhóm cao cấp.',
  },
  {
    name: 'Thành Bưởi Coach 29 chỗ',
    type: 'bus',
    capacity: 29,
    providerName: 'Thanh Buoi Express',
    description: 'Xe coach 29 chỗ cho hành trình ngắn.',
  },
];

async function getHotelLocations() {
  const preferredSlugs = [
    'da-nang',
    'thua-thien-hue',
    'ho-chi-minh',
    'ha-noi',
    'khanh-hoa',
    'lam-dong',
    'can-tho',
    'kien-giang',
    'binh-dinh',
    'ba-ria-vung-tau',
  ];

  const slugLocations = await prisma.locations.findMany({
    where: { slug: { in: preferredSlugs } },
    select: { location_id: true, slug: true },
  });

  const bySlug = new Map(slugLocations.map((loc) => [loc.slug, loc.location_id]));
  const idsByPriority: number[] = [];
  for (const slug of preferredSlugs) {
    const id = bySlug.get(slug);
    if (id) idsByPriority.push(id);
  }

  if (idsByPriority.length >= 10) {
    return idsByPriority.slice(0, 10);
  }

  const fallbackLocations = await prisma.locations.findMany({
    orderBy: { location_id: 'asc' },
    select: { location_id: true },
    take: 10,
  });

  const merged = [...idsByPriority];
  for (const loc of fallbackLocations) {
    if (merged.length >= 10) break;
    if (!merged.includes(loc.location_id)) merged.push(loc.location_id);
  }

  if (merged.length < 10) {
    throw new Error(
      `Không đủ địa điểm để seed khách sạn. Hiện có ${merged.length} địa điểm khả dụng.`,
    );
  }

  return merged;
}

async function upsertProvider(seed: ProviderSeed) {
  return prisma.providers.upsert({
    where: { name: seed.name },
    update: {
      type: seed.type,
      contact_info: seed.contactInfo,
      status: 1,
    },
    create: {
      name: seed.name,
      type: seed.type,
      contact_info: seed.contactInfo,
      status: 1,
    },
  });
}

async function upsertTransport(seed: TransportSeed, providerId: number) {
  const existing = await prisma.transports.findFirst({
    where: {
      name: seed.name,
      provider_id: providerId,
    },
    select: { transport_id: true },
  });

  if (existing) {
    return prisma.transports.update({
      where: { transport_id: existing.transport_id },
      data: {
        transport_type: seed.type,
        capacity: seed.capacity,
        description: seed.description,
        status: 1,
      },
    });
  }

  return prisma.transports.create({
    data: {
      name: seed.name,
      transport_type: seed.type,
      capacity: seed.capacity,
      provider_id: providerId,
      description: seed.description,
      status: 1,
    },
  });
}

async function upsertHotelWithSingleRoom(seed: HotelSeed, locationId: number) {
  const existing = await prisma.hotels.findFirst({
    where: { name: seed.name },
    select: { hotel_id: true },
  });

  const hotel = existing
    ? await prisma.hotels.update({
        where: { hotel_id: existing.hotel_id },
        data: {
          location_id: locationId,
          star_rating: seed.starRating,
          address: seed.address,
          phone: seed.phone,
          email: seed.email,
          description: seed.description,
          status: 1,
        },
      })
    : await prisma.hotels.create({
        data: {
          location_id: locationId,
          name: seed.name,
          star_rating: seed.starRating,
          address: seed.address,
          phone: seed.phone,
          email: seed.email,
          description: seed.description,
          status: 1,
        },
      });

  const roomName = 'Phòng đơn';
  const room = await prisma.hotel_room_types.findFirst({
    where: {
      hotel_id: hotel.hotel_id,
      name: roomName,
    },
    select: { room_type_id: true },
  });

  if (room) {
    await prisma.hotel_room_types.update({
      where: { room_type_id: room.room_type_id },
      data: {
        base_price: seed.singleRoomPrice,
        extra_price: 0,
        breakfast_included: true,
        description: `Phòng đơn cho 1 khách, giá ${seed.singleRoomPrice.toLocaleString('vi-VN')} VNĐ/ đêm.`,
        status: 1,
      },
    });
    return;
  }

  await prisma.hotel_room_types.create({
    data: {
      hotel_id: hotel.hotel_id,
      name: roomName,
      base_price: seed.singleRoomPrice,
      extra_price: 0,
      breakfast_included: true,
      description: `Phòng đơn cho 1 khách, giá ${seed.singleRoomPrice.toLocaleString('vi-VN')} VNĐ/ đêm.`,
      status: 1,
    },
  });
}

async function main() {
  console.log('Bắt đầu seed 10 khách sạn + 10 phương tiện...');

  const locationIds = await getHotelLocations();

  let providerCount = 0;
  for (const providerSeed of providerSeeds) {
    await upsertProvider(providerSeed);
    providerCount++;
  }

  const providers = await prisma.providers.findMany({
    where: {
      name: {
        in: providerSeeds.map((item) => item.name),
      },
    },
    select: { provider_id: true, name: true },
  });
  const providerIdByName = new Map(
    providers.map((provider) => [provider.name, provider.provider_id]),
  );

  let transportCount = 0;
  for (const transportSeed of transportSeeds) {
    const providerId = providerIdByName.get(transportSeed.providerName);
    if (!providerId) {
      throw new Error(`Không tìm thấy nhà cung cấp: ${transportSeed.providerName}`);
    }
    await upsertTransport(transportSeed, providerId);
    transportCount++;
  }

  let hotelCount = 0;
  for (let i = 0; i < hotelSeeds.length; i++) {
    await upsertHotelWithSingleRoom(hotelSeeds[i], locationIds[i]);
    hotelCount++;
  }

  console.log(`Seed xong: ${hotelCount} khách sạn, ${transportCount} phương tiện, ${providerCount} nhà cung cấp.`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error(`Seed thất bại: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
