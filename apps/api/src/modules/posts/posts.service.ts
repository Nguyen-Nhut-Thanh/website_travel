import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { slugify } from '../../common/utils';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.post_categories.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
  }

  async createCategory(data: { name: string; description?: string }) {
    const slug = slugify(data.name);
    return this.prisma.post_categories.create({
      data: { ...data, slug },
    });
  }

  async findAllAdmin(query: { category_id?: number; search?: string }) {
    const where: any = {};
    if (query.category_id) where.category_id = Number(query.category_id);
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.posts.findMany({
      where,
      include: {
        category: { select: { name: true } },
        author: { select: { email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async createPost(authorId: number, data: any) {
    const slug = data.slug || slugify(data.title);
    return this.prisma.posts.create({
      data: {
        ...data,
        slug,
        author_id: authorId,
        category_id: Number(data.category_id),
        status: Number(data.status || 1),
      },
    });
  }

  async updatePost(id: number, data: any) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
    if (data.category_id) data.category_id = Number(data.category_id);
    if (data.status !== undefined) data.status = Number(data.status);

    return this.prisma.posts.update({
      where: { post_id: id },
      data,
    });
  }

  async deletePost(id: number) {
    return this.prisma.posts.delete({ where: { post_id: id } });
  }

  async getPublicPosts(limit = 10, categorySlug?: string) {
    const where: any = { status: 1 };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    return this.prisma.posts.findMany({
      where,
      select: {
        post_id: true,
        title: true,
        slug: true,
        summary: true,
        thumbnail: true,
        created_at: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { created_at: 'desc' },
      take: Number(limit),
    });
  }

  async getPostDetail(slug: string) {
    const post = await this.prisma.posts.findUnique({
      where: { slug, status: 1 },
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { email: true } },
      },
    });

    if (!post) throw new NotFoundException('Không tìm thấy bài viết');

    return post;
  }
}
