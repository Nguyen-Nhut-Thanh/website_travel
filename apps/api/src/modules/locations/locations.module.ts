import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsAdminService } from './locations-admin.service';
import { LocationsPublicService } from './locations-public.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [LocationsController],
  providers: [PrismaService, LocationsAdminService, LocationsPublicService],
  exports: [LocationsAdminService, LocationsPublicService],
})
export class LocationsModule {}
