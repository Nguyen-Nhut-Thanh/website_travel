import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
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
import type {
  AdminLoginPayload,
  AuthRequestUser,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from './auth.types';

type AuthRequest = Request & {
  user: AuthRequestUser;
};

type CloudinaryUploadResult = {
  secure_url: string;
};

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/upload-avatar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    try {
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'travel_v2/avatars',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
          },
          (error, uploadResult) => {
            if (error || !uploadResult) return reject(error);
            resolve(uploadResult as CloudinaryUploadResult);
          },
        );
        uploadStream.end(file.buffer);
      });

      return { url: result.secure_url };
    } catch (error) {
      const uploadError = error as Error;
      this.logger.error('[Avatar Upload Error]', uploadError);
      throw new InternalServerErrorException(
        `Lỗi khi upload avatar lên Cloudinary: ${uploadError.message}`,
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
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() data: UpdateProfilePayload,
  ) {
    return this.authService.updateProfile(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/change-password')
  async changePassword(
    @Req() req: AuthRequest,
    @Body() dto: ChangePasswordPayload,
  ) {
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
  async getMe(@Req() req: AuthRequest) {
    return this.authService.getMe(req.user.sub);
  }

  @Post('admin/auth/login')
  async adminLogin(@Body() body: AdminLoginPayload) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/auth/me')
  async adminMe(@Req() req: AuthRequest) {
    if (!req.user.isStaff) {
      throw new ForbiddenException('Bạn không có quyền quản trị');
    }

    const user = await this.authService.getMe(req.user.sub);
    if (!user || !user.is_staff) {
      throw new ForbiddenException('Quyền quản trị đã bị thu hồi');
    }

    return { user };
  }
}
