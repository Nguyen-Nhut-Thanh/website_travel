//apps/api/src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  GoogleLoginDto,
} from './dto/auth.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.accounts.findUnique({
      where: { email: dto.email },
    });
    if (existing)
      throw new BadRequestException('Email đã tồn tại trên hệ thống');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Code hết hạn sau 15 phút

    await this.prisma.$transaction(async (tx) => {
      const account = await tx.accounts.create({
        data: {
          email: dto.email,
          password_hash: hashedPassword,
          provider: 'local',
          verification_code: verificationCode,
          verification_expires_at: expiresAt,
          status: 1,
        },
      });

      await tx.users.create({
        data: {
          account_id: account.account_id,
          full_name: dto.full_name,
          profile_completed: false,
        },
      });
    });

    // Gửi mail thực tế
    await this.mailService.sendVerificationEmail(dto.email, verificationCode);

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã xác thực.',
    };
  }

  async resendVerificationCode(email: string) {
    const account = await this.prisma.accounts.findUnique({ where: { email } });
    if (!account) throw new BadRequestException('Không tìm thấy tài khoản');
    if (account.email_verified)
      throw new BadRequestException('Email đã được xác thực trước đó');

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: {
        verification_code: verificationCode,
        verification_expires_at: expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(email, verificationCode);

    return { message: 'Mã xác thực mới đã được gửi đến email của bạn.' };
  }

  async updateProfile(userId: number, data: any) {
    try {
      return await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          full_name: data.full_name || undefined,
          phone: data.phone === '' ? null : data.phone || undefined,
          address: data.address === '' ? null : data.address || undefined,
          avatar_url: data.avatar_url || undefined,
          gender: data.gender || undefined,
          number_id: data.number_id === '' ? null : data.number_id || undefined,
          profile_completed: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        if (target.includes('phone')) {
          throw new BadRequestException(
            'Số điện thoại này đã được sử dụng bởi người dùng khác',
          );
        }
        if (target.includes('number_id')) {
          throw new BadRequestException(
            'Số CCCD/Hộ chiếu này đã được sử dụng bởi người dùng khác',
          );
        }
        throw new BadRequestException(
          'Thông tin bị trùng lặp với người dùng khác',
        );
      }
      throw error;
    }
  }

  async getMeByEmail(email: string) {
    return this.prisma.accounts.findUnique({
      where: { email },
      include: { users: true },
    });
  }

  async changePassword(userId: number, dto: any) {
    const account = await this.prisma.accounts.findFirst({
      where: { users: { user_id: userId } },
    });

    if (!account) throw new BadRequestException('Không tìm thấy tài khoản');

    // Nếu đã có mật khẩu, bắt buộc phải kiểm tra mật khẩu cũ
    if (account.password_hash) {
      if (!dto.oldPassword)
        throw new BadRequestException('Vui lòng nhập mật khẩu cũ');
      const isMatch = await bcrypt.compare(
        dto.oldPassword,
        account.password_hash,
      );
      if (!isMatch)
        throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: { password_hash: newHashedPassword },
    });

    return {
      message: account.password_hash
        ? 'Đổi mật khẩu thành công'
        : 'Thiết lập mật khẩu thành công',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const account = await this.prisma.accounts.findUnique({
      where: { email: dto.email },
    });
    if (!account) throw new BadRequestException('Không tìm thấy tài khoản');
    if (account.email_verified)
      throw new BadRequestException('Email đã được xác thực trước đó');

    if (account.verification_code !== dto.code) {
      throw new BadRequestException('Mã xác thực không chính xác');
    }

    if (
      !account.verification_expires_at ||
      new Date() > account.verification_expires_at
    ) {
      throw new BadRequestException(
        'Mã xác thực đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu mã mới.',
      );
    }

    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: {
        email_verified: true,
        email_verified_at: new Date(),
        verification_code: null,
        verification_expires_at: null,
      },
    });

    return {
      message: 'Xác thực email thành công. Bây giờ bạn có thể đăng nhập.',
    };
  }

  async login(dto: LoginDto) {
    const account = await this.prisma.accounts.findUnique({
      where: { email: dto.email },
      include: { users: true },
    });

    if (!account || !account.password_hash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (account.status !== 1) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    if (!account.email_verified) {
      throw new UnauthorizedException(
        'Email chưa được xác thực. Vui lòng xác thực trước khi đăng nhập.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, account.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Cập nhật last login
    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: { last_login_at: new Date() },
    });

    return this.generateTokens(account);
  }

  async googleLogin(dto: GoogleLoginDto) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new BadRequestException('Google token không hợp lệ');

      const { email, sub, name, picture } = payload;

      let account = await this.prisma.accounts.findUnique({
        where: { email: email! },
        include: { users: true },
      });

      if (!account) {
        // Tạo tài khoản mới từ Google
        account = await this.prisma.$transaction(async (tx) => {
          const newAcc = await tx.accounts.create({
            data: {
              email: email!,
              provider: 'google',
              provider_account_id: sub,
              email_verified: true,
              email_verified_at: new Date(),
              status: 1,
            },
          });
          const newUser = await tx.users.create({
            data: {
              account_id: newAcc.account_id,
              full_name: name || 'Người dùng Google',
              avatar_url: picture,
              profile_completed: false,
            },
          });
          return { ...newAcc, users: newUser };
        });
      } else {
        // Nếu đã có account, cập nhật provider account id nếu chưa có
        if (!account.provider_account_id) {
          await this.prisma.accounts.update({
            where: { account_id: account.account_id },
            data: {
              provider_account_id: sub,
              email_verified: true, // Google email luôn uy tín
              email_verified_at: account.email_verified_at || new Date(),
            },
          });
        }
      }

      if (account.status !== 1) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      return this.generateTokens(account);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Xác thực Google thất bại');
    }
  }

  async adminLogin(email: string, password: string) {
    const account = await this.prisma.accounts.findUnique({
      where: { email },
      include: { users: true },
    });

    if (!account || !account.password_hash)
      throw new UnauthorizedException('Thông tin không chính xác');

    const ok = await bcrypt.compare(password, account.password_hash);
    if (!ok) throw new UnauthorizedException('Thông tin không chính xác');

    if (!account.users?.is_staff)
      throw new UnauthorizedException(
        'Bạn không có quyền truy cập trang quản trị',
      );

    return this.generateTokens(account);
  }

  private async generateTokens(account: any) {
    const payload = {
      sub: account.users.user_id,
      email: account.email,
      accountId: account.account_id,
      isStaff: account.users.is_staff,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        user_id: account.users.user_id,
        full_name: account.users.full_name,
        email: account.email,
        avatar_url: account.users.avatar_url,
        profile_completed: account.users.profile_completed,
        isStaff: account.users.is_staff,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        accounts: {
          select: {
            email: true,
            provider: true,
            email_verified: true,
            last_login_at: true,
            password_hash: true,
          },
        },
      },
    });

    if (!user) return null;

    const { password_hash, ...accountInfo } = user.accounts;
    return {
      ...user,
      accounts: {
        ...accountInfo,
        hasPassword: !!password_hash,
      },
    };
  }
}
