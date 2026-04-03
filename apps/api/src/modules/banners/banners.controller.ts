import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { memoryStorage } from 'multer';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {
    // Đảm bảo Cloudinary được cấu hình khi instance được tạo
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  @Get('public')
  async getPublicBanners() {
    return this.bannersService.getPublicBanners();
  }

  // --- ADMIN ROUTES ---

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async findAll() {
    return this.bannersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  async findOne(@Param('id') id: string) {
    return this.bannersService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async create(@Body() data: any) {
    return this.bannersService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.bannersService.update(Number(id), data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    return this.bannersService.remove(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    try {
      // Log thông tin file để debug (chỉ log meta, không log buffer)
      console.log(
        `[Upload Banner] Received file: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`,
      );

      // Kiểm tra biến môi trường
      if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY) {
        throw new InternalServerErrorException(
          'Cấu hình Cloudinary bị thiếu trên server',
        );
      }

      // Upload trực tiếp từ buffer lên Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'travel_v2/banners',
            // Nới lỏng hoặc bỏ allowed_formats để test nếu cần
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('[Cloudinary Stream Error]', error);
              return reject(error);
            }
            resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      return { url: (result as any).secure_url };
    } catch (error) {
      console.error('[Upload Banner Final Error]', error);
      // Trả về lỗi chi tiết hơn để debug
      const message = error.message || 'Lỗi không xác định';
      throw new InternalServerErrorException(`Lỗi upload: ${message}`);
    }
  }
}
