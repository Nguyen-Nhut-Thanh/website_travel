import type { Conversation } from "@/types/chat";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://api.nhutthanh.id.vn";

export const AI_BASE_URL =
  process.env.NEXT_PUBLIC_AI_BASE?.replace(/\/+$/, "") ||
  "https://ai.nhutthanh.id.vn";

export const CHAT_IMAGE_PLACEHOLDER = "/next.svg";

export const DEFAULT_AI_GREETING =
  "Xin chào! Tôi là Trợ lý ảo Travol. Tôi có thể giúp bạn tìm kiếm những hành trình phù hợp nhất. Bạn muốn đi đâu hôm nay?";

export const DEFAULT_AI_FALLBACK_GREETING =
  "Chào bạn! Chatbot Travol đã sẵn sàng. Hãy cho tôi biết kế hoạch chuyến đi của bạn nhé!";

export function formatConversationTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getConversationPreview(conversation: Conversation) {
  if (!conversation.last_message) return "Bắt đầu cuộc trò chuyện";

  return conversation.last_message === "[Image]"
    ? "Đã gửi một ảnh"
    : conversation.last_message;
}

export function createPreviewUrl(file: File) {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(previewUrl?: string | null) {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
}
