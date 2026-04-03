"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import {
  API_BASE_URL,
  createPreviewUrl,
  getConversationPreview,
  revokePreviewUrl,
} from "@/lib/chat";
import { getToken } from "@/lib/auth";
import { useToast } from "@/components/common/Toast";
import { ChatWorkspace } from "./ChatWorkspace";
import { ConversationSidebar } from "./ConversationSidebar";
import type { Conversation, PendingImage, RealtimeMessage } from "@/types/chat";

export default function AdminChatsPage() {
  const token = getToken();
  const { success, error: showError } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [typingMap, setTypingMap] = useState<Record<number, boolean>>({});
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.conversation_id === selectedId,
    ) || null;

  const unreadTotal = useMemo(
    () =>
      conversations.reduce(
        (sum, conversation) => sum + (conversation.unread_count || 0),
        0,
      ),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((conversation) => {
      const name = conversation.users?.full_name?.toLowerCase() ?? "";
      const preview = getConversationPreview(conversation).toLowerCase();
      return name.includes(keyword) || preview.includes(keyword);
    });
  }, [conversations, searchTerm]);

  const activeTyping =
    selectedConversation?.users?.user_id != null
      ? typingMap[selectedConversation.users.user_id]
      : false;

  const resizeComposer = useCallback(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      120,
    )}px`;
  }, []);

  const resetComposer = useCallback(() => {
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  const clearPendingImage = useCallback(() => {
    setPendingImage((current) => {
      revokePreviewUrl(current?.previewUrl);
      return null;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const emitTyping = useCallback(
    (value: string) => {
      if (!token || !selectedId) return;
      getSocket(token).emit("chat:typing", {
        conversation_id: selectedId,
        is_typing: value.trim().length > 0,
      });
    },
    [selectedId, token],
  );

  const markConversationRead = useCallback(
    (conversationId: number) => {
      if (!token) return;

      getSocket(token).emit("chat:read", { conversation_id: conversationId });
      setConversations((current) =>
        current.map((conversation) =>
          conversation.conversation_id === conversationId
            ? { ...conversation, unread_count: 0 }
            : conversation,
        ),
      );
    },
    [token],
  );

  const loadConversations = useCallback(async () => {
    if (!token) return;

    setLoadingConversations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: unknown = await response.json();
      setConversations(Array.isArray(data) ? (data as Conversation[]) : []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [token]);

  const loadMessages = useCallback(
    async (conversationId: number) => {
      if (!token) return;

      setLoadingMessages(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/chat/messages/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data: unknown = await response.json();
        setMessages(Array.isArray(data) ? (data as RealtimeMessage[]) : []);
        markConversationRead(conversationId);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [markConversationRead, token],
  );

  const selectConversation = useCallback(
    async (conversationId: number) => {
      if (!token) return;

      setSelectedId(conversationId);
      setShowMenu(false);
      setShowDeleteConfirm(false);
      clearPendingImage();
      resetComposer();
      getSocket(token).emit("chat:join", { conversation_id: conversationId });
      await loadMessages(conversationId);
    },
    [clearPendingImage, loadMessages, resetComposer, token],
  );

  const uploadImage = useCallback(async () => {
    if (!token || !pendingImage) return null;

    const formData = new FormData();
    formData.append("file", pendingImage.file);

    const response = await fetch(`${API_BASE_URL}/chat/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data &&
      "url" in data &&
      typeof data.url === "string"
    ) {
      return data.url;
    }

    throw new Error("Image upload failed");
  }, [pendingImage, token]);

  const sendMessage = useCallback(async () => {
    if (!token || !selectedId || sending) return;

    const text = input.trim();
    if (!text && !pendingImage) return;

    setSending(true);
    const socket = getSocket(token);

    try {
      if (text) {
        socket.emit("chat:send", {
          conversation_id: selectedId,
          content: text,
          message_type: "TEXT",
        });
      }

      if (pendingImage) {
        const imageUrl = await uploadImage();
        if (imageUrl) {
          socket.emit("chat:send", {
            conversation_id: selectedId,
            content: imageUrl,
            message_type: "IMAGE",
          });
        }
      }

      socket.emit("chat:typing", {
        conversation_id: selectedId,
        is_typing: false,
      });
      resetComposer();
      clearPendingImage();
    } catch {
      showError("Không thể gửi tin nhắn lúc này.");
    } finally {
      setSending(false);
    }
  }, [
    clearPendingImage,
    input,
    pendingImage,
    resetComposer,
    selectedId,
    sending,
    showError,
    token,
    uploadImage,
  ]);

  const handleDeleteConversation = useCallback(async () => {
    if (!token || !selectedId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversations/${selectedId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        showError("Không thể xóa cuộc hội thoại.");
        return;
      }

      success("Đã xóa cuộc hội thoại.");
      setSelectedId(null);
      setShowDeleteConfirm(false);
      setMessages([]);
      await loadConversations();
    } catch {
      showError("Lỗi kết nối máy chủ.");
    }
  }, [loadConversations, selectedId, showError, success, token]);

  useEffect(() => {
    if (!token) return;
    void loadConversations();
  }, [loadConversations, token]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    const onMessage = (message: RealtimeMessage) => {
      setConversations((current) => {
        const existing = current.find(
          (conversation) =>
            conversation.conversation_id === message.conversation_id,
        );
        if (!existing) {
          void loadConversations();
          return current;
        }

        const unreadIncrement =
          message.sender_role === "USER" &&
          message.conversation_id !== selectedId
            ? 1
            : 0;

        const updatedConversation: Conversation = {
          ...existing,
          last_message:
            message.message_type === "IMAGE" ? "[Image]" : message.content,
          last_message_at: message.created_at,
          unread_count:
            message.sender_role === "USER" &&
            message.conversation_id === selectedId
              ? 0
              : existing.unread_count + unreadIncrement,
        };

        return [
          updatedConversation,
          ...current.filter(
            (conversation) =>
              conversation.conversation_id !== message.conversation_id,
          ),
        ];
      });

      if (message.conversation_id === selectedId) {
        setMessages((current) => [...current, message]);
        if (message.sender_role === "USER") {
          markConversationRead(message.conversation_id);
        }
      }
    };

    const onTyping = (payload: { user_id: number; is_typing: boolean }) => {
      setTypingMap((current) => ({
        ...current,
        [payload.user_id]: payload.is_typing,
      }));
    };

    const onConversationUpdated = () => {
      void loadConversations();
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:typing", onTyping);
    socket.on("chat:conversation:updated", onConversationUpdated);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:typing", onTyping);
      socket.off("chat:conversation:updated", onConversationUpdated);
    };
  }, [loadConversations, markConversationRead, selectedId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId, typingMap]);

  useEffect(() => {
    resizeComposer();
  }, [input, resizeComposer]);

  useEffect(() => {
    return () => {
      revokePreviewUrl(pendingImage?.previewUrl);
    };
  }, [pendingImage]);

  if (!token) return null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#f8fafc] text-slate-900 transition-all">
      <ConversationSidebar
        conversations={filteredConversations}
        unreadTotal={unreadTotal}
        selectedId={selectedId}
        loading={loadingConversations}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={() => void loadConversations()}
        onSelect={(conversationId) => void selectConversation(conversationId)}
      />

      <ChatWorkspace
        selectedId={selectedId}
        selectedConversation={selectedConversation}
        messages={messages}
        loadingMessages={loadingMessages}
        input={input}
        sending={sending}
        pendingImage={pendingImage}
        showMenu={showMenu}
        showDeleteConfirm={showDeleteConfirm}
        activeTyping={Boolean(activeTyping)}
        lightboxUrl={lightboxUrl}
        textareaRef={textareaRef}
        fileInputRef={fileInputRef}
        bottomRef={bottomRef}
        onBack={() => setSelectedId(null)}
        onInputChange={(value) => {
          setInput(value);
          emitTyping(value);
        }}
        onSend={() => void sendMessage()}
        onPickImage={() => fileInputRef.current?.click()}
        onFileChange={(file) => {
          if (!file) return;
          setPendingImage({
            file,
            previewUrl: createPreviewUrl(file),
          });
        }}
        onClearPendingImage={clearPendingImage}
        onToggleMenu={() => setShowMenu((current) => !current)}
        onOpenDeleteConfirm={() => {
          setShowMenu(false);
          setShowDeleteConfirm(true);
        }}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        onDeleteConversation={() => void handleDeleteConversation()}
        onOpenLightbox={setLightboxUrl}
        onCloseLightbox={() => setLightboxUrl(null)}
      />
    </div>
  );
}
