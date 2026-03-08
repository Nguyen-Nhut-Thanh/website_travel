import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PublicToursController } from './public_tours.controller';
import { ToursController } from './tours.controller';
import { ToursAdminService } from './tours-admin.service';
import { ToursPublicService } from './tours-public.service';
import { ToursService } from './tours.service';

@Module({
  controllers: [ToursController, PublicToursController],
  providers: [
    PrismaService,
    ToursService,
    ToursAdminService,
    ToursPublicService,
  ],
  exports: [ToursService, ToursAdminService, ToursPublicService],
})
export class ToursModule {}
