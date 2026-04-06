import {
  Logger,
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
import type { BannerPayload } from './banners.types';

type CloudinaryUploadResult = {
  secure_url: string;
};

@Controller('banners')
export class BannersController {
  private readonly logger = new Logger(BannersController.name);

  constructor(private readonly bannersService: BannersService) {
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
  async create(@Body() data: BannerPayload) {
    return this.bannersService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() data: BannerPayload) {
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
      this.logger.log(
        `[Upload Banner] Received file: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`,
      );

      if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY) {
        throw new InternalServerErrorException(
          'Cấu hình Cloudinary bị thiếu trên server',
        );
      }

      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'travel_v2/banners',
            resource_type: 'auto',
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              this.logger.error('[Cloudinary Stream Error]', error);
              return reject(error);
            }
            resolve(uploadResult as CloudinaryUploadResult);
          },
        );
        uploadStream.end(file.buffer);
      });

      return { url: result.secure_url };
    } catch (error) {
      this.logger.error('[Upload Banner Final Error]', error);
      const uploadError = error as Error;
      const message = uploadError.message || 'Lỗi không xác định';
      throw new InternalServerErrorException(`Lỗi upload: ${message}`);
    }
  }
}
