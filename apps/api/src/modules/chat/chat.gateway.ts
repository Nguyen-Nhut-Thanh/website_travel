import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

type JwtChatPayload = {
  sub: number;
  email: string;
  accountId?: number;
  isStaff?: boolean;
};

type ConnectedChatUser = JwtChatPayload & {
  userId: number;
  is_staff?: boolean;
};

type JoinPayload = {
  conversation_id?: number;
};

type SendPayload = {
  conversation_id: number;
  content: string;
  message_type?: 'TEXT' | 'IMAGE';
};

type TypingPayload = {
  conversation_id: number;
  is_typing: boolean;
};

type ReadPayload = {
  conversation_id: number;
};

function getConnectedUser(client: Socket): ConnectedChatUser | null {
  const data = client.data as { user?: ConnectedChatUser };
  return data.user ?? null;
}

function setConnectedUser(client: Socket, user: ConnectedChatUser) {
  const data = client.data as { user?: ConnectedChatUser };
  data.user = user;
}

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) {
    return configuredOrigins;
  }

  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://nhutthanh.id.vn',
    'https://www.nhutthanh.id.vn',
    'https://api.nhutthanh.id.vn',
    'https://ai.nhutthanh.id.vn',
  ];
}

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth as { token?: string } | undefined;
      const headers = client.handshake.headers as {
        authorization?: string | string[] | undefined;
      };
      const headerToken = Array.isArray(headers.authorization)
        ? headers.authorization[0]
        : headers.authorization;
      const token = auth?.token || headerToken?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtChatPayload>(token);
      const userId = await this.chatService.getUserIdFromAuth({
        accountId: payload.accountId,
        userId: payload.sub,
      });

      if (!userId) {
        client.disconnect();
        return;
      }

      setConnectedUser(client, { ...payload, userId });
      this.logger.log(`User connected: ${payload.email} (userId: ${userId})`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown socket error';
      this.logger.error(`Socket connection error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect() {
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinPayload,
  ) {
    const user = getConnectedUser(client);
    if (!user) return { error: 'Unauthorized' };

    let convId = data.conversation_id;

    if (!user.isStaff && !user.is_staff) {
      const conv = await this.chatService.getOrCreateConversation(user.userId);
      convId = conv.conversation_id;
    } else if (!convId) {
      return { error: 'Admin/Staff must provide conversation_id' };
    }

    void client.join(`conv_${convId}`);
    return { conversation_id: convId };
  }

  @SubscribeMessage('chat:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendPayload,
  ) {
    const user = getConnectedUser(client);
    if (!user) return { error: 'Unauthorized' };

    if (!user.isStaff && !user.is_staff) {
      const conv = await this.chatService.getOrCreateConversation(user.userId);
      if (conv.conversation_id !== data.conversation_id) {
        return { error: 'Unauthorized to send to this conversation' };
      }
    }

    const message = await this.chatService.saveMessage({
      conversation_id: data.conversation_id,
      sender_id: user.userId,
      sender_role: user.isStaff || user.is_staff ? 'ADMIN' : 'USER',
      content: data.content,
      message_type: data.message_type ?? 'TEXT',
    });

    this.server
      .to(`conv_${data.conversation_id}`)
      .emit('chat:message', message);
    this.server.emit('chat:conversation:updated', {
      conversation_id: data.conversation_id,
      last_message: message.message_type === 'IMAGE' ? '[Image]' : data.content,
    });
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    const user = getConnectedUser(client);
    if (!user) return;

    client.to(`conv_${data.conversation_id}`).emit('chat:typing', {
      user_id: user.userId,
      is_typing: data.is_typing,
    });
  }

  @SubscribeMessage('chat:read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ReadPayload,
  ) {
    const user = getConnectedUser(client);
    if (!user) return { error: 'Unauthorized' };

    await this.chatService.markAsRead(
      data.conversation_id,
      user.isStaff || user.is_staff ? 'ADMIN' : 'USER',
    );

    this.server.emit('chat:conversation:updated', {
      conversation_id: data.conversation_id,
      read: true,
    });
    return { success: true };
  }
}
