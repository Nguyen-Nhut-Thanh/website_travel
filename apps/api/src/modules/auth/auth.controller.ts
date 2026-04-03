import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  GoogleLoginDto,
} from './dto/auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {
    // Khởi tạo cấu hình cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  // --- USER AUTH ENDPOINTS ---

  @UseGuards(JwtAuthGuard)
  @Post('auth/upload-avatar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'travel_v2/avatars',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      return { url: (result as any).secure_url };
    } catch (error) {
      console.error('[Avatar Upload Error]', error);
      throw new InternalServerErrorException(
        'Lỗi khi upload avatar lên Cloudinary: ' + error.message,
      );
    }
  }

  @Post('auth/register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('auth/verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('auth/resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationCode(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/update-profile')
  async updateProfile(@Req() req: any, @Body() data: any) {
    return this.authService.updateProfile(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/change-password')
  async changePassword(@Req() req: any, @Body() dto: any) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Post('auth/login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('auth/google')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  async getMe(@Req() req: any) {
    // req.user được gán bởi JwtStrategy (payload)
    return this.authService.getMe(req.user.sub);
  }

  // --- ADMIN AUTH ENDPOINTS ---

  @Post('admin/auth/login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    const data = await this.authService.adminLogin(body.email, body.password);
    // Trả về thẳng dữ liệu giống như login thường
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/auth/me')
  async adminMe(@Req() req: any) {
    if (!req.user.isStaff) {
      throw new ForbiddenException('Bạn không có quyền quản trị');
    }
    // Trả về thông tin user từ DB để đảm bảo is_staff mới nhất
    const user = await this.authService.getMe(req.user.sub);
    if (!user || !user.is_staff) {
      throw new ForbiddenException('Quyền quản trị đã bị thu hồi');
    }
    return { user };
  }
}
