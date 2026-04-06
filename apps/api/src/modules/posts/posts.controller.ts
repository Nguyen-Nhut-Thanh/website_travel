import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type {
  PostAdminQuery,
  PostCategoryPayload,
  PostPayload,
} from './posts.types';
import type { AuthRequestUser } from '../auth/auth.types';

type AuthRequest = Request & {
  user: AuthRequestUser;
};

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('public/posts')
  getPublicPosts(
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.postsService.getPublicPosts(Number(limit) || 10, category);
  }

  @Get('public/posts/categories')
  getPublicCategories() {
    return this.postsService.findAllCategories();
  }

  @Get('public/posts/:slug')
  getPostDetail(@Param('slug') slug: string) {
    return this.postsService.getPostDetail(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/posts')
  findAllAdmin(@Query() query: PostAdminQuery) {
    return this.postsService.findAllAdmin(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/posts')
  create(@Req() req: AuthRequest, @Body() data: PostPayload) {
    return this.postsService.createPost(req.user.accountId!, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/posts/:id')
  update(@Param('id') id: string, @Body() data: PostPayload) {
    return this.postsService.updatePost(Number(id), data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/posts/:id')
  remove(@Param('id') id: string) {
    return this.postsService.deletePost(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/post-categories')
  findAllCats() {
    return this.postsService.findAllCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/post-categories')
  createCat(@Body() data: PostCategoryPayload) {
    return this.postsService.createCategory(data);
  }
}
