import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { memoryStorage } from 'multer';
import { LocationsAdminService } from './locations-admin.service';
import { LocationsPublicService } from './locations-public.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { LocationAdminPayload } from './locations.types';

type CloudinaryUploadResult = {
  secure_url: string;
};

@Controller()
export class LocationsController {
  constructor(
    private readonly locationsAdminService: LocationsAdminService,
    private readonly locationsPublicService: LocationsPublicService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  @Get('locations/featured-destinations')
  getFeaturedDestinations() {
    return this.locationsPublicService.getFeaturedDestinations();
  }

  @Get('locations/nav')
  getNavigationData() {
    return this.locationsPublicService.getNavigationData();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/locations')
  async findAll(
    @Query('search') search?: string,
    @Query('level_id') level_id?: string,
  ) {
    return this.locationsAdminService.findAll({ search, level_id });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/locations/by-level')
  async listByLevel(
    @Query('level_id') level_id: string,
    @Query('parent_id') parent_id?: string,
  ) {
    return this.locationsAdminService.listByLevel(
      Number(level_id),
      parent_id ? Number(parent_id) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/locations/levels')
  async listLevels() {
    return this.locationsAdminService.listLevels();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/locations/parents')
  async listParents() {
    return this.locationsAdminService.listParents();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/locations/featured')
  async getFeatured() {
    return this.locationsAdminService.getFeatured();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/locations/:id')
  async findOne(@Param('id') id: string) {
    return this.locationsAdminService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/locations')
  async create(@Body() body: LocationAdminPayload) {
    return this.locationsAdminService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/locations/:id')
  async update(@Param('id') id: string, @Body() body: LocationAdminPayload) {
    return this.locationsAdminService.update(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/locations/:id')
  async remove(@Param('id') id: string) {
    return this.locationsAdminService.remove(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/locations/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadLocationImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    try {
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'travel_v2/locations',
            resource_type: 'auto',
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
      throw new InternalServerErrorException(
        `Lỗi upload ảnh địa điểm: ${uploadError.message}`,
      );
    }
  }
}
