import { getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/chat";
import type { Conversation, RealtimeMessage } from "@/types/chat";

type ChatJsonInit = Omit<RequestInit, "headers"> & {
  fallbackMessage: string;
};

async function requestAdminChat<T>(
  path: string,
  init: ChatJsonInit,
): Promise<T> {
  const { fallbackMessage, ...rest } = init;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | T
    | null;

  if (!response.ok) {
    throw new Error(
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : fallbackMessage,
    );
  }

  return data as T;
}

export function getAdminChatConversations() {
  return requestAdminChat<Conversation[]>("/chat/conversations", {
    method: "GET",
    fallbackMessage: "Không thể tải danh sách hội thoại.",
  });
}

export function getAdminChatMessages(conversationId: number) {
  return requestAdminChat<RealtimeMessage[]>(`/chat/messages/${conversationId}`, {
    method: "GET",
    fallbackMessage: "Không thể tải tin nhắn.",
  });
}

export async function uploadAdminChatImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/chat/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string; url?: string }
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.message || "Không thể tải ảnh lên.");
  }

  return data.url;
}

export function deleteAdminConversation(conversationId: number) {
  return requestAdminChat(`/chat/conversations/${conversationId}`, {
    method: "DELETE",
    fallbackMessage: "Không thể xóa cuộc hội thoại.",
  });
}
