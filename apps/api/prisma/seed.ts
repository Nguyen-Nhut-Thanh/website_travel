// apps/api/prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import * as bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ===== 1) Seed admin =====
  const email = 'admin@travel.com';
  const password = '123456';
  const password_hash = await bcrypt.hash(password, 10);

  const account = await prisma.accounts.upsert({
    where: { email },
    update: { password_hash },
    create: { email, password_hash, status: 1 },
  });

  const user = await prisma.users.upsert({
    where: { account_id: account.account_id },
    update: { is_staff: true },
    create: {
      account_id: account.account_id,
      number_id: '000000000001',
      full_name: 'Admin',
      gender: 'other',
      phone: '0900000000',
      is_staff: true,
    },
  });

  console.log('✅ Seed admin done:', email, password);

  // ===== 2) Seed base data (để FK của tours không bị fail) =====

  // geographic_levels: name UNIQUE
  const level = await prisma.geographic_levels.upsert({
    where: { name: 'Province' },
    update: {},
    create: { name: 'Province', description: 'Tỉnh/Thành phố' },
  });

  // locations: name UNIQUE, level_id FK
  const location = await prisma.locations.upsert({
    where: { name: 'Cần Thơ' },
    update: {},
    create: {
      name: 'Cần Thơ',
      level_id: level.level_id,
      country_code: 'VN',
      note: 'Seed location',
    },
  });

  // providers: name UNIQUE
  const provider = await prisma.providers.upsert({
    where: { name: 'Default Provider' },
    update: {},
    create: {
      name: 'Default Provider',
      type: 'car',
      contact_info: '0900000000 - provider@travel.com',
      status: 1,
    },
  });

  // transports: không có unique field -> findFirst rồi create nếu chưa có
  let transport = await prisma.transports.findFirst({
    where: {
      name: 'Xe khách',
      provider_id: provider.provider_id,
    },
  });

  if (!transport) {
    transport = await prisma.transports.create({
      data: {
        transport_type: 'bus',
        name: 'Xe khách',
        capacity: 30,
        provider_id: provider.provider_id,
        status: 1,
        description: 'Seed transport',
      },
    });
  }

  console.log('✅ Seed base data:', {
    location_id: location.location_id,
    transport_id: transport.transport_id,
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
