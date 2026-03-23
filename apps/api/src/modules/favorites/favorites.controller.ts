import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('ids')
  async getMyFavoriteIds(@Req() req: any) {
    return this.favoritesService.getMyFavoriteIds(req.user.sub);
  }

  @Get('my')
  async getMyFavorites(@Req() req: any) {
    return this.favoritesService.getMyFavorites(req.user.sub);
  }

  @Post(':tourId')
  async addFavorite(
    @Req() req: any,
    @Param('tourId', ParseIntPipe) tourId: number,
  ) {
    return this.favoritesService.addFavorite(req.user.sub, tourId);
  }

  @Delete(':tourId')
  async removeFavorite(
    @Req() req: any,
    @Param('tourId', ParseIntPipe) tourId: number,
  ) {
    return this.favoritesService.removeFavorite(req.user.sub, tourId);
  }
}
