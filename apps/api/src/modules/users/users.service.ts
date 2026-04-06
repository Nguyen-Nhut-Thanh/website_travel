import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import type { CreateStaffPayload } from './users.types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async findUserAccountOrThrow(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { account_id: true, is_staff: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async findAll() {
    return this.prisma.users.findMany({
      include: {
        accounts: {
          select: {
            email: true,
            status: true,
            last_login_at: true,
            provider: true,
          },
        },
        staff_profiles: true,
        role_users: {
          include: {
            roles: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        accounts: {
          select: {
            email: true,
            status: true,
            last_login_at: true,
            provider: true,
          },
        },
        staff_profiles: true,
        role_users: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async createStaff(dto: CreateStaffPayload) {
    const existing = await this.prisma.accounts.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email đã tồn tại trên hệ thống');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.accounts.create({
        data: {
          email: dto.email,
          password_hash: hashedPassword,
          provider: 'local',
          email_verified: true,
          email_verified_at: new Date(),
          status: 1,
        },
      });

      const user = await tx.users.create({
        data: {
          account_id: account.account_id,
          full_name: dto.full_name,
          phone: dto.phone,
          is_staff: true,
          profile_completed: true,
        },
      });

      await tx.staff_profiles.create({
        data: {
          user_id: user.user_id,
          employee_code: dto.employee_code || `STF${Date.now()}`,
          position: dto.position || 'Nhân viên',
          status: 1,
        },
      });

      const adminRole = await tx.roles.findUnique({ where: { name: 'admin' } });
      if (adminRole) {
        await tx.role_users.create({
          data: {
            user_id: user.user_id,
            role_id: adminRole.role_id,
          },
        });
      }

      return user;
    });
  }

  async updateStatus(userId: number, status: number) {
    const user = await this.findUserAccountOrThrow(userId);

    return this.prisma.accounts.update({
      where: { account_id: user.account_id },
      data: { status },
    });
  }

  async toggleStaffStatus(userId: number) {
    const user = await this.findUserAccountOrThrow(userId);

    return this.prisma.users.update({
      where: { user_id: userId },
      data: { is_staff: !user.is_staff },
    });
  }

  async deleteUser(userId: number) {
    const user = await this.findUserAccountOrThrow(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.staff_profiles.deleteMany({ where: { user_id: userId } });
      await tx.role_users.deleteMany({ where: { user_id: userId } });
      await tx.favorites.deleteMany({ where: { user_id: userId } });
      await tx.reviews.deleteMany({ where: { user_id: userId } });

      const bookingsCount = await tx.bookings.count({
        where: { user_id: userId },
      });
      if (bookingsCount > 0) {
        throw new BadRequestException(
          'Không thể xóa người dùng đã có lịch sử đặt tour. Hãy khóa tài khoản thay thế.',
        );
      }

      await tx.users.delete({ where: { user_id: userId } });
      await tx.accounts.delete({ where: { account_id: user.account_id } });

      return { message: 'Xóa người dùng thành công' };
    });
  }
}
