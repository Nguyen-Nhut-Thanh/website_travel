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
import type { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { AuthRequestUser } from '../auth/auth.types';

type AuthRequest = Request & {
  user: AuthRequestUser;
};

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('ids')
  async getMyFavoriteIds(@Req() req: AuthRequest) {
    return this.favoritesService.getMyFavoriteIds(req.user.sub);
  }

  @Get('my')
  async getMyFavorites(@Req() req: AuthRequest) {
    return this.favoritesService.getMyFavorites(req.user.sub);
  }

  @Post(':tourId')
  async addFavorite(
    @Req() req: AuthRequest,
    @Param('tourId', ParseIntPipe) tourId: number,
  ) {
    return this.favoritesService.addFavorite(req.user.sub, tourId);
  }

  @Delete(':tourId')
  async removeFavorite(
    @Req() req: AuthRequest,
    @Param('tourId', ParseIntPipe) tourId: number,
  ) {
    return this.favoritesService.removeFavorite(req.user.sub, tourId);
  }
}
