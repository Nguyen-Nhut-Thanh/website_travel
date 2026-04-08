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
import { ToursAdminService } from './tours-admin.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { ScheduleAdminPayload, TourAdminPayload } from './tours.types';

type CloudinaryUploadResult = {
  secure_url: string;
};

@Controller()
export class ToursController {
  constructor(private readonly toursAdminService: ToursAdminService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/tours/upload-schedule-image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadScheduleImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file');
    }

    try {
      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'travel_v2/schedules', resource_type: 'auto' },
            (error, uploadResult) => {
              if (error || !uploadResult) {
                return reject(
                  error instanceof Error
                    ? error
                    : new Error('Upload image failed'),
                );
              }

              return resolve(uploadResult as CloudinaryUploadResult);
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      return { url: result.secure_url };
    } catch (error) {
      const uploadError = error as Error;
      throw new InternalServerErrorException(
        `Lỗi upload ảnh: ${uploadError.message}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/catalogs/hotels')
  listHotels() {
    return this.toursAdminService.listHotels();
  }

  @Get('admin/catalogs/hotels/:id/room-types')
  listRoomTypes(@Param('id') id: string) {
    return this.toursAdminService.listHotelRoomTypes(Number(id));
  }

  @Get('admin/catalogs/transports')
  listAllTransports() {
    return this.toursAdminService.listAllTransports();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/tours')
  list(@Query('search') search?: string, @Query('status') status?: string) {
    return this.toursAdminService.list({ search, status });
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/tours')
  create(@Body() body: TourAdminPayload) {
    return this.toursAdminService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/tours/schedules/:scheduleId')
  findOneSchedule(@Param('scheduleId') scheduleId: string) {
    return this.toursAdminService.findOneSchedule(Number(scheduleId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/tours/schedules/:scheduleId/delete')
  deleteSchedule(@Param('scheduleId') scheduleId: string) {
    return this.toursAdminService.deleteSchedule(Number(scheduleId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/tours/schedules/:scheduleId')
  deleteScheduleByDelete(@Param('scheduleId') scheduleId: string) {
    return this.toursAdminService.deleteSchedule(Number(scheduleId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/tours/schedules/:scheduleId')
  updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() body: ScheduleAdminPayload,
  ) {
    return this.toursAdminService.updateSchedule(Number(scheduleId), body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/tours/:id')
  detail(@Param('id') id: string) {
    return this.toursAdminService.detail(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/tours/:id')
  update(@Param('id') id: string, @Body() body: TourAdminPayload) {
    return this.toursAdminService.update(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/tours/:id/status')
  toggleStatus(@Param('id') id: string) {
    return this.toursAdminService.toggleStatus(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/tours/:id')
  deleteTour(@Param('id') id: string) {
    return this.toursAdminService.deleteTour(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/tours/:id/schedules')
  listSchedules(@Param('id') id: string) {
    return this.toursAdminService.listSchedules(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/tours/:id/schedules')
  createSchedule(@Param('id') id: string, @Body() body: ScheduleAdminPayload) {
    return this.toursAdminService.createSchedule(Number(id), body);
  }
}
