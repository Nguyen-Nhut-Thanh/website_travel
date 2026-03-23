import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

type MarkAsReadRole = 'ADMIN' | 'USER';
type ChatMessageRecord = {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: string;
  message_type: 'TEXT' | 'IMAGE';
  content: string;
  is_read: boolean;
  created_at: Date;
};

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getUserIdByAccountId(accountId: number) {
    const user = await this.prisma.users.findUnique({
      where: { account_id: accountId },
      select: { user_id: true },
    });
    return user?.user_id;
  }

  async getOrCreateConversation(userId: number) {
    let conv = await this.prisma.conversations.findFirst({
      where: { user_id: userId, status: 'OPEN' },
    });

    if (!conv) {
      conv = await this.prisma.conversations.create({
        data: { user_id: userId },
      });
    }
    return conv;
  }

  async saveMessage(data: {
    conversation_id: number;
    sender_id: number;
    sender_role: string;
    content: string;
    message_type?: string;
  }): Promise<ChatMessageRecord> {
    const messageType = data.message_type ?? 'TEXT';
    const conversationPreview =
      messageType === 'IMAGE' ? '[Image]' : data.content;

    return this.prisma.$transaction(async (tx) => {
      const [message] = await tx.$queryRaw<ChatMessageRecord[]>`
        INSERT INTO messages (
          conversation_id,
          sender_id,
          sender_role,
          message_type,
          content
        )
        VALUES (
          ${data.conversation_id},
          ${data.sender_id},
          ${data.sender_role},
          ${messageType},
          ${data.content}
        )
        RETURNING
          message_id,
          conversation_id,
          sender_id,
          sender_role,
          message_type,
          content,
          is_read,
          created_at
      `;

      await tx.conversations.update({
        where: { conversation_id: data.conversation_id },
        data: {
          last_message: conversationPreview,
          last_message_at: new Date(),
        },
      });

      return message;
    });
  }

  async getMessages(conversationId: number): Promise<ChatMessageRecord[]> {
    return this.prisma.$queryRaw<ChatMessageRecord[]>`
      SELECT
        message_id,
        conversation_id,
        sender_id,
        sender_role,
        message_type,
        content,
        is_read,
        created_at
      FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;
  }

  async getAdminConversations() {
    return this.prisma.conversations.findMany({
      include: {
        _count: {
          select: {
            messages: {
              where: {
                is_read: false,
                sender_role: 'USER',
              },
            },
          },
        },
        users: {
          select: {
            user_id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { last_message_at: 'desc' },
    });
  }

  async markAsRead(conversationId: number, readerRole: MarkAsReadRole) {
    const senderRoleToMark = readerRole === 'ADMIN' ? 'USER' : 'ADMIN';

    return this.prisma.messages.updateMany({
      where: {
        conversation_id: conversationId,
        is_read: false,
        sender_role: senderRoleToMark,
      },
      data: { is_read: true },
    });
  }

  async deleteConversation(conversationId: number) {
    return this.prisma.conversations.delete({
      where: { conversation_id: conversationId },
    });
  }
}
