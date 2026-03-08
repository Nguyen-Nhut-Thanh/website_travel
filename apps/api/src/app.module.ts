import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { ToursModule } from './modules/tours/tours.module';
import { LocationsModule } from './modules/locations/locations.module';
import { TransportsModule } from './modules/transports/transports.module';
import { BannersModule } from './modules/banners/banners.module';

@Module({
  imports: [
    AuthModule,
    ToursModule,
    LocationsModule,
    TransportsModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
