import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

type AuthenticatedRequest = {
  user: {
    accountId: number;
    isStaff?: boolean;
    is_staff?: boolean;
  };
};

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('conversations')
  async getConversations(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user.isStaff && !user.is_staff) {
      const userId = await this.chatService.getUserIdByAccountId(
        user.accountId,
      );
      if (!userId) return [];
      const conv = await this.chatService.getOrCreateConversation(userId);
      return [{ ...conv, unread_count: 0 }];
    }

    const conversations = await this.chatService.getAdminConversations();
    return conversations.map((conversation) => ({
      ...conversation,
      unread_count: conversation._count.messages,
    }));
  }

  @Get('messages/:id')
  async getMessages(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    const convId = Number(id);
    const readerRole = user.isStaff || user.is_staff ? 'ADMIN' : 'USER';

    if (!user.isStaff && !user.is_staff) {
      const userId = await this.chatService.getUserIdByAccountId(
        user.accountId,
      );
      if (!userId) throw new ForbiddenException();

      const conv = await this.chatService.getOrCreateConversation(userId);
      if (conv.conversation_id !== convId) {
        throw new ForbiddenException('Unauthorized to view this conversation');
      }
    }

    await this.chatService.markAsRead(convId, readerRole);
    return this.chatService.getMessages(convId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Khong tim thay file');
    }

    try {
      const result = await new Promise<UploadApiResponse>(
        (resolve, reject: (reason?: Error) => void) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'travel_v2/chat_images' },
            (error, uploadResult) => {
              if (error)
                return reject(
                  new Error(
                    error instanceof Error
                      ? error.message
                      : 'Cloudinary upload failed',
                  ),
                );
              if (!uploadResult)
                return reject(new Error('Upload result missing'));
              resolve(uploadResult);
            },
          );
          uploadStream.end(file.buffer);
        },
      );

      return { url: result.secure_url };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      throw new BadRequestException(`Loi upload: ${message}`);
    }
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    if (!user.isStaff && !user.is_staff) {
      throw new ForbiddenException('Only staff can delete conversations');
    }
    return this.chatService.deleteConversation(Number(id));
  }
}
