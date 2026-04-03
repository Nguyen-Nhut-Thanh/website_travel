import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // --- PUBLIC ENDPOINTS ---
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

  // --- ADMIN ENDPOINTS ---
  @UseGuards(JwtAuthGuard)
  @Get('admin/posts')
  findAllAdmin(@Query() query: any) {
    return this.postsService.findAllAdmin(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/posts')
  create(@Request() req: any, @Body() data: any) {
    return this.postsService.createPost(req.user.account_id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/posts/:id')
  update(@Param('id') id: string, @Body() data: any) {
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
  createCat(@Body() data: any) {
    return this.postsService.createCategory(data);
  }
}
