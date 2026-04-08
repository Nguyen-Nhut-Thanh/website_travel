import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';
//npm.cmd run grant:admin -w api -- nguyennhutthanh25.2005@gmail.com

const envCandidates = [
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '..', '..', '..', '.env'),
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath, override: false, quiet: true });
}

const emailArg = process.argv[2]?.trim().toLowerCase();

if (!emailArg) {
  console.error(
    'Thiếu email. Dùng lệnh: npm run grant:admin -w api -- user@example.com',
  );
  process.exit(1);
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

async function main() {
  const account = await prisma.accounts.findFirst({
    where: {
      email: {
        equals: emailArg,
        mode: 'insensitive',
      },
    },
    include: {
      users: {
        include: {
          role_users: {
            include: {
              roles: true,
            },
          },
        },
      },
    },
  });

  if (!account?.users) {
    throw new Error(
      `Không tìm thấy tài khoản người dùng với email "${emailArg}".`,
    );
  }

  const user = account.users;

  const adminRole =
    (await prisma.roles.findUnique({
      where: { name: 'admin' },
    })) ??
    (await prisma.roles.create({
      data: {
        name: 'admin',
        description: 'Quyền quản trị hệ thống',
      },
    }));

  const existingAdminRole = user.role_users.some(
    (roleUser) => roleUser.roles.name === 'admin',
  );

  await prisma.$transaction(async (tx) => {
    if (!user.is_staff) {
      await tx.users.update({
        where: { user_id: user.user_id },
        data: { is_staff: true },
      });
    }

    if (!existingAdminRole) {
      await tx.role_users.create({
        data: {
          user_id: user.user_id,
          role_id: adminRole.role_id,
        },
      });
    }
  });

  console.log(
    [
      `Đã cấp quyền admin cho ${account.email}.`,
      `user_id=${user.user_id}`,
      'is_staff=true',
      `role=admin${existingAdminRole ? ' (đã tồn tại từ trước)' : ''}`,
    ].join(' '),
  );
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error(`Cấp quyền admin thất bại: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
