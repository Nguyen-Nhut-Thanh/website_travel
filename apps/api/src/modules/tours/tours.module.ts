import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PublicToursController } from './public_tours.controller';
import { ToursController } from './tours.controller';
import { ToursAdminService } from './tours-admin.service';
import { ToursPublicService } from './tours-public.service';

@Module({
  controllers: [ToursController, PublicToursController],
  providers: [PrismaService, ToursAdminService, ToursPublicService],
  exports: [ToursAdminService, ToursPublicService],
})
export class ToursModule {}
