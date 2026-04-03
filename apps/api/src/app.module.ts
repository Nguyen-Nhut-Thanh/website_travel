import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { ToursModule } from './modules/tours/tours.module';
import { LocationsModule } from './modules/locations/locations.module';
import { TransportsModule } from './modules/transports/transports.module';
import { BannersModule } from './modules/banners/banners.module';
import { FlashDealsModule } from './modules/flash-deals/flash-deals.module';
import { FeaturedToursModule } from './modules/featured-tours/featured-tours.module';
import { MailModule } from './modules/mail/mail.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RecommendationProfileModule } from './modules/recommendation-profile/recommendation-profile.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    AuthModule,
    ToursModule,
    LocationsModule,
    TransportsModule,
    BannersModule,
    FlashDealsModule,
    FeaturedToursModule,
    MailModule,
    BookingsModule,
    FavoritesModule,
    CloudinaryModule,
    VouchersModule,
    UsersModule,
    PostsModule,
    ChatModule,
    PaymentModule,
    RecommendationProfileModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
