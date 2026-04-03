import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env từ apps/api
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PROVINCES_URL =
  'https://huynhminhvangit.github.io/vn-region-api/data/provinces.json';

// Mapping mã tỉnh thành vào 3 miền (Dựa trên mã code tiêu chuẩn)
const REGION_MAPPING = {
  north: {
    name: 'Miền Bắc',
    slug: 'mien-bac',
    codes: [
      '01',
      '02',
      '04',
      '06',
      '08',
      '10',
      '11',
      '12',
      '14',
      '15',
      '17',
      '19',
      '20',
      '22',
      '24',
      '25',
      '26',
      '27',
      '30',
      '31',
      '33',
      '34',
      '35',
      '36',
      '37',
    ],
  },
  central: {
    name: 'Miền Trung',
    slug: 'mien-trung',
    codes: [
      '38',
      '40',
      '42',
      '44',
      '45',
      '46',
      '48',
      '49',
      '51',
      '52',
      '54',
      '56',
      '58',
      '60',
      '62',
      '64',
      '66',
      '67',
      '68',
    ],
  },
  south: {
    name: 'Miền Nam',
    slug: 'mien-nam',
    codes: [
      '70',
      '72',
      '74',
      '75',
      '77',
      '79',
      '80',
      '82',
      '83',
      '84',
      '86',
      '87',
      '89',
      '91',
      '92',
      '93',
      '94',
      '95',
      '96',
    ],
  },
};

function normalizeProvinceName(name: string) {
  return name
    .replace(/^(Thành phố trực thuộc trung ương)\s+/i, '')
    .replace(/^(Thành phố|Tỉnh)\s+/i, '')
    .trim();
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL NOT FOUND');
    return;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🚀 BẮT ĐẦU NHẬP DỮ LIỆU ĐỊA ĐIỂM...');

    // 0. Đảm bảo có các Geographic Levels (1-7)
    const levels = [
      { id: 1, name: 'Global', desc: 'Toàn cầu' },
      { id: 2, name: 'Continent Group', desc: 'Nhóm châu lục' },
      { id: 3, name: 'Country', desc: 'Quốc gia' },
      { id: 4, name: 'Subcountry Region', desc: 'Vùng / Miền' },
      { id: 5, name: 'Province / State', desc: 'Tỉnh / Thành phố' },
      { id: 6, name: 'City / Destination', desc: 'Thành phố / Điểm đến' },
      { id: 7, name: 'Attraction', desc: 'Điểm tham quan' },
    ];

    for (const lv of levels) {
      await prisma.geographic_levels.upsert({
        where: { level_id: lv.id },
        update: { name: lv.name },
        create: {
          level_id: lv.id,
          name: lv.name,
          description: lv.desc,
        },
      });
    }
    console.log('✅ Đã khởi tạo bảng Geographic Levels.');

    // 1. Đảm bảo có quốc gia Việt Nam (Level 3)
    const vietnam = await prisma.locations.upsert({
      where: { slug: 'viet-nam' },
      update: {},
      create: {
        name: 'Việt Nam',
        slug: 'viet-nam',
        location_type: 'country',
        level_id: 3,
        country_code: 'VN',
      },
    });
    console.log('✅ Đã xác nhận: Việt Nam (ID: ' + vietnam.location_id + ')');

    // 2. Tạo/Cập nhật 3 miền (Level 4)
    const regions: Record<string, any> = {};
    for (const key of Object.keys(REGION_MAPPING)) {
      const r = REGION_MAPPING[key as keyof typeof REGION_MAPPING];
      regions[key] = await prisma.locations.upsert({
        where: { slug: r.slug },
        update: { parent_id: vietnam.location_id },
        create: {
          name: r.name,
          slug: r.slug,
          location_type: 'subcountry_region',
          level_id: 4,
          parent_id: vietnam.location_id,
          country_code: 'VN',
        },
      });
      console.log(`--- Miền: ${r.name}`);
    }

    // 3. Lấy dữ liệu từ API
    const response = await fetch(PROVINCES_URL);
    const apiData: any[] = await response.json();
    console.log(`📦 Lấy được ${apiData.length} tỉnh thành từ API.`);

    // 4. Insert Tỉnh/Thành (Level 5)
    let count = 0;
    for (const p of apiData) {
      let regionId = null;
      if (REGION_MAPPING.north.codes.includes(p.code))
        regionId = regions.north.location_id;
      else if (REGION_MAPPING.central.codes.includes(p.code))
        regionId = regions.central.location_id;
      else if (REGION_MAPPING.south.codes.includes(p.code))
        regionId = regions.south.location_id;

      if (!regionId) continue;

      const normalizedName = normalizeProvinceName(p.name);
      const slug =
        p.slug ||
        normalizedName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'd')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

      await prisma.locations.upsert({
        where: { slug: slug },
        update: {
          name: normalizedName,
          parent_id: regionId,
          country_code: 'VN',
          level_id: 5,
        },
        create: {
          name: normalizedName,
          slug: slug,
          location_type: 'province_state',
          level_id: 5,
          parent_id: regionId,
          country_code: 'VN',
        },
      });
      count++;
    }

    console.log(
      `\n✨ THÀNH CÔNG: Đã nhập ${count} tỉnh thành vào cơ sở dữ liệu.`,
    );
  } catch (error) {
    console.error('❌ LỖI:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
