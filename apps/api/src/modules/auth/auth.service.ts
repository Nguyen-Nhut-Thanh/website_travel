//apps/api/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const account = await this.prisma.accounts.findUnique({ where: { email } });
    if (!account) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, account.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const user = await this.prisma.users.findUnique({
      where: { account_id: account.account_id },
      select: { user_id: true, full_name: true, is_staff: true },
    });

    if (!user?.is_staff) throw new UnauthorizedException('Not staff');

    const token = await this.jwt.signAsync({
      sub: user.user_id,
      name: user.full_name,
      is_staff: user.is_staff,
    });

    return { accessToken: token };
  }
}
