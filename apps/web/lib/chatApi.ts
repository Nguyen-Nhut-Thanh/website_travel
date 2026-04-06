import { AI_BASE_URL, API_BASE_URL } from "@/lib/chat";

export async function getChatConversations(token: string) {
  const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function getChatMessages(token: string, conversationId: number) {
  const response = await fetch(`${API_BASE_URL}/chat/messages/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function uploadChatImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/chat/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json().catch(() => null);
  return data?.url ?? null;
}

export async function getAiConversationMessages(sessionId: string) {
  const response = await fetch(`${AI_BASE_URL}/api/conversations/${sessionId}/messages`);
  return response.json();
}

export async function sendAiChatMessage(sessionId: string, message: string) {
  const response = await fetch(`${AI_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  return response.json();
}
