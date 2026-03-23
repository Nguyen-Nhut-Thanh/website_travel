"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  MoreVertical,
  RefreshCcw,
  Search,
  SendHorizontal,
  Trash2,
  User as UserIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import { getToken } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/components/common/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type Conversation = {
  conversation_id: number;
  user_id: number;
  status: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  users?: {
    user_id: number;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

type RealtimeMessage = {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: "USER" | "ADMIN" | "STAFF";
  message_type: "TEXT" | "IMAGE";
  content: string;
  is_read: boolean;
  created_at: string;
};

type PendingImage = {
  file: File;
  previewUrl: string;
};

function formatConversationTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPreview(conversation: Conversation) {
  if (!conversation.last_message) return "Bắt đầu cuộc trò chuyện";
  return conversation.last_message === "[Image]"
    ? "Đã gửi một ảnh"
    : conversation.last_message;
}

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

  const resizeComposer = useCallback(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, []);

  const resetComposer = useCallback(() => {
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
  }, []);

  const clearPendingImage = useCallback(() => {
    setPendingImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoadingConversations(true);
    try {
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: unknown = await res.json();
      setConversations(Array.isArray(data) ? (data as Conversation[]) : []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [token]);

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

  const loadMessages = useCallback(
    async (conversationId: number) => {
      if (!token) return;
      setLoadingMessages(true);
      try {
        const res = await fetch(`${API_BASE}/chat/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: unknown = await res.json();
        setMessages(Array.isArray(data) ? (data as RealtimeMessage[]) : []);
        markConversationRead(conversationId);
      } catch (error) {
        console.error("Error loading messages:", error);
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

  const handleDeleteConversation = async () => {
    if (!token || !selectedId) return;

    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${selectedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        success("Đã xóa cuộc hội thoại");
        setSelectedId(null);
        setShowDeleteConfirm(false);
        void loadConversations();
      } else {
        showError("Không thể xóa cuộc hội thoại");
      }
    } catch (error) {
      showError("Lỗi kết nối máy chủ");
    }
  };

  const uploadImage = useCallback(async () => {
    if (!token || !pendingImage) return null;
    const formData = new FormData();
    formData.append("file", pendingImage.file);
    const res = await fetch(`${API_BASE}/chat/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data: unknown = await res.json();
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
        if (textareaRef.current) textareaRef.current.style.height = "44px";
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
    } catch (error) {
      console.error("Error sending message:", error);
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
    token,
    uploadImage,
  ]);

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

        const updated: Conversation = {
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
          updated,
          ...current.filter(
            (conversation) =>
              conversation.conversation_id !== message.conversation_id,
          ),
        ];
      });

      if (message.conversation_id === selectedId) {
        setMessages((current) => [...current, message]);
        if (message.sender_role === "USER")
          markConversationRead(message.conversation_id);
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
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    };
  }, [pendingImage]);

  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return conversations;
    return conversations.filter((conversation) => {
      const name = conversation.users?.full_name?.toLowerCase() ?? "";
      const preview = getPreview(conversation).toLowerCase();
      return name.includes(keyword) || preview.includes(keyword);
    });
  }, [conversations, searchTerm]);

  const activeTyping =
    selectedConversation?.users?.user_id != null
      ? typingMap[selectedConversation.users.user_id]
      : false;

  if (!token) return null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#f8fafc] text-slate-900 transition-all">
      {/* Cột trái: Danh sách hội thoại */}
      <aside
        className={`${
          selectedId ? "hidden md:flex" : "flex"
        } w-full flex-col border-r border-slate-200 md:w-[280px] lg:w-[320px] shrink-0 bg-white`}
      >
        {/* Header Sidebar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-[#f8fafc]/50 px-4 backdrop-blur-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Hội thoại ({unreadTotal})
          </h2>
          <button
            type="button"
            onClick={() => void loadConversations()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-blue-600"
          >
            <RefreshCcw size={14} className={loadingConversations ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Ô tìm kiếm */}
        <div className="p-2.5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
              size={14}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm khách..."
              className="h-9 w-full rounded-xl border-none bg-slate-50 pl-9 pr-4 text-[12px] font-medium text-slate-600 outline-none transition focus:bg-slate-100/80"
            />
          </div>
        </div>

        {/* Danh sách hội thoại */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide">
          {loadingConversations && !conversations.length ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          ) : filteredConversations.length ? (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.conversation_id === selectedId;
                const isUnread = conversation.unread_count > 0;

                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    onClick={() =>
                      void selectConversation(conversation.conversation_id)
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="relative shrink-0">
                      {conversation.users?.avatar_url ? (
                        <img
                          src={conversation.users.avatar_url}
                          alt={conversation.users.full_name}
                          className="h-10 w-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                          <UserIcon size={16} />
                        </div>
                      )}
                      {!isActive && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`truncate text-[13px] ${isActive ? "font-bold" : isUnread ? "font-black text-slate-900" : "font-semibold text-slate-800"}`}>
                          {conversation.users?.full_name || "Khách hàng"}
                        </p>
                        <span className={`shrink-0 text-[9px] ${isActive ? "text-white/70" : "opacity-60"}`}>
                          {formatConversationTime(conversation.last_message_at)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className={`truncate text-[12px] ${isActive ? "text-white/80" : isUnread ? "font-bold text-slate-800" : "opacity-60"}`}>
                          {getPreview(conversation)}
                        </p>
                        {isUnread && !isActive && (
                          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                Trống
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Cột phải: Nội dung chat */}
      <main
        className={`${
          !selectedId ? "hidden md:flex" : "flex"
        } flex-1 flex-col bg-[#f1f5f9]/30`}
      >
        {selectedConversation ? (
          <div className="flex h-full flex-col relative">
            {/* Header Chat */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 md:hidden"
                >
                  <ArrowLeft size={18} />
                </button>
                
                <div className="relative shrink-0">
                  {selectedConversation.users?.avatar_url ? (
                    <img
                      src={selectedConversation.users.avatar_url}
                      alt={selectedConversation.users.full_name}
                      className="h-9 w-9 rounded-full object-cover border border-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-black text-slate-900 tracking-tight">
                    {selectedConversation.users?.full_name || "Khách hàng"}
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    {activeTyping ? "Đang soạn..." : "Trực tuyến"}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${showMenu ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
                >
                  <MoreVertical size={18} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                      Xóa cuộc trò chuyện
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-10">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="mx-auto flex flex-col gap-1">
                  {messages.map((message, index) => {
                    const isAdmin = message.sender_role !== "USER";
                    const prevMsg = messages[index - 1];
                    const nextMsg = messages[index + 1];
                    
                    const isFirstInGroup = !prevMsg || prevMsg.sender_role !== message.sender_role;
                    const isLastInGroup = !nextMsg || nextMsg.sender_role !== message.sender_role;

                    return (
                      <div
                        key={message.message_id}
                        className={`flex gap-3 ${isAdmin ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-4" : "mb-0.5"}`}
                      >
                        {!isAdmin && (
                          <div className="h-8 w-8 shrink-0">
                            {isFirstInGroup ? (
                              selectedConversation.users?.avatar_url ? (
                                <img
                                  src={selectedConversation.users.avatar_url}
                                  alt={selectedConversation.users.full_name}
                                  className="h-full w-full rounded-full object-cover border border-slate-100 shadow-sm"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-500">
                                  <UserIcon size={14} />
                                </div>
                              )
                            ) : null}
                          </div>
                        )}

                        <div className={`flex max-w-[75%] flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                          <div
                            className={`shadow-sm ${
                              isAdmin
                                ? `bg-blue-600 text-white ${
                                    isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"
                                  } ${
                                    isLastInGroup ? "rounded-bl-2xl rounded-br-none" : "rounded-l-lg"
                                  }`
                                : `bg-white text-slate-800 border border-slate-100 ${
                                    isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"
                                  } ${
                                    isLastInGroup ? "rounded-br-2xl rounded-bl-none" : "rounded-r-lg"
                                  }`
                            } ${
                              message.message_type === "IMAGE"
                                ? isAdmin 
                                  ? "p-0 overflow-hidden bg-transparent shadow-none"
                                  : "p-1"
                                : "px-4 py-2 text-[13.5px] font-medium leading-relaxed"
                            }`}
                          >
                            {message.message_type === "IMAGE" ? (
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(message.content)}
                                className="block overflow-hidden rounded-xl"
                              >
                                <img
                                  src={message.content}
                                  alt="Content"
                                  className="max-h-[350px] w-full object-contain"
                                />
                              </button>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                          </div>
                          
                          {isLastInGroup && (
                            <span className="mt-1 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {formatMessageTime(message.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} className="h-2" />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="mx-auto w-full max-w-5xl">
                {pendingImage && (
                  <div className="mb-3 flex items-center gap-3 rounded-2xl border border-blue-50 bg-blue-50/30 p-2.5">
                    <img
                      src={pendingImage.previewUrl}
                      alt="Pending"
                      className="h-14 w-14 rounded-xl object-cover shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[11px] font-black text-slate-900">{pendingImage.file.name}</p>
                    </div>
                    <button onClick={clearPendingImage} className="text-slate-400 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-[#f8fafc] hover:text-blue-600 transition-all border border-slate-100"
                  >
                    <ImageIcon size={22} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
                    }}
                  />
                  
                  <div className="flex-1 rounded-2xl bg-slate-100 px-4 focus-within:bg-slate-200/50 transition-colors border border-slate-200">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        resizeComposer();
                        if (token && selectedId) {
                          getSocket(token).emit("chat:typing", {
                            conversation_id: selectedId,
                            is_typing: e.target.value.trim().length > 0,
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void sendMessage();
                        }
                      }}
                      placeholder="Nhập phản hồi..."
                      className="w-full resize-none bg-transparent py-2.5 text-[13px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={(!input.trim() && !pendingImage) || sending}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                      <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Xóa hội thoại?</h3>
                    <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed px-2">
                      Hành động này sẽ xóa vĩnh viễn toàn bộ tin nhắn. Bạn không thể hoàn tác sau khi xác nhận.
                    </p>
                    
                    <div className="mt-8 flex w-full flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => void handleDeleteConversation()}
                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-rose-600 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 active:scale-95"
                      >
                        Xác nhận xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.04),_transparent_40%)]">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-xl shadow-blue-900/5 text-blue-100">
              <MessageSquare size={38} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Trung tâm hỗ trợ</h3>
            <p className="mt-2 max-w-[240px] text-[13px] font-medium text-slate-400 leading-relaxed">
              Hệ thống sẵn sàng. Vui lòng chọn một khách hàng để bắt đầu tư vấn.
            </p>
          </div>
        )}
      </main>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
