export class SendMessageDto {
  conversation_id: number;
  content: string;
}

export class JoinConversationDto {
  conversation_id?: number;
}
