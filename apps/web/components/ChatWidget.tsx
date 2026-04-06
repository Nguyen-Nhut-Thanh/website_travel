"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CHAT_IMAGE_PLACEHOLDER,
  createPreviewUrl,
  DEFAULT_AI_FALLBACK_GREETING,
  DEFAULT_AI_GREETING,
  revokePreviewUrl,
} from "@/lib/chat";
import {
  getAiConversationMessages,
  getChatConversations,
  getChatMessages,
  sendAiChatMessage,
  uploadChatImage,
} from "@/lib/chatApi";
import { getSocket } from "@/lib/socket";
import { getToken } from "@/lib/auth";
import {
  MessageSquare,
  Bot,
  Send,
  X,
  Zap,
  User,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import type { ChatMessage, Conversation, PendingImage, RealtimeMessage } from "@/types/chat";

export const ChatWidget = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [realtimeMessages, setRealtimeMessages] = useState<RealtimeMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [convId, setConvId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const token = typeof window !== "undefined" ? getToken() : null;

  // Reset state when token changes (login/logout)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRealtimeMessages([]);
      setConvId(null);
      setConversations([]);
      if (!getToken()) {
        setIsRealtime(false);
      }
    }
  }, [token]);

  const loadConversations = async () => {
    const currentToken = getToken();
    if (!currentToken) return;
    try {
      setConversations(await getChatConversations(currentToken));
    } catch {
      setConversations([]);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && getToken()) {
      loadConversations();
    }
  }, [isOpen, token]);

  // Load AI History
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUser = getToken();
      let userIdentifier = "guest";
      if (currentUser) {
        try {
          const payload = JSON.parse(atob(currentUser.split(".")[1]));
          userIdentifier = payload.sub || payload.userId || "user";
        } catch {
          userIdentifier = "user";
        }
      }

      const storageKey = `chat_session_id_${userIdentifier}`;
      let sid = sessionStorage.getItem(storageKey);
      if (!sid) {
        sid = "sid_" + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem(storageKey, sid);
      }
      setSessionId(sid);

      if (!isRealtime) {
        getAiConversationMessages(sid)
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              setMessages(data);
            } else {
              setMessages([
                {
                  role: "assistant",
                  content: DEFAULT_AI_GREETING,
                },
              ]);
            }
          })
          .catch(() => {
            setMessages([
              {
                role: "assistant",
                content: DEFAULT_AI_FALLBACK_GREETING,
              },
            ]);
          });
      }
    }
  }, [isRealtime, token]);

  // Handle Realtime Socket
  useEffect(() => {
    const currentToken = getToken();
    if (currentToken) {
      const socket = getSocket(currentToken);

      const handleMessage = (msg: RealtimeMessage) => {
        if (isRealtime && isOpen && msg.conversation_id === convId) {
          setRealtimeMessages((prev) => [...prev, msg]);
          socket.emit("chat:read", { conversation_id: msg.conversation_id });
        }
        loadConversations();
      };

      socket.on("chat:message", handleMessage);
      socket.on("chat:typing", (data) => {
        if (isRealtime && isOpen && data.conversation_id === convId) {
          setIsTyping(data.is_typing);
        }
      });

      if (isRealtime && isOpen) {
        socket.emit(
          "chat:join",
          convId ? { conversation_id: convId } : {},
          (res: { conversation_id?: number } | undefined) => {
            if (res && res.conversation_id) {
              setConvId(res.conversation_id);
              if (!convId) {
                getChatMessages(currentToken, res.conversation_id)
                  .then((data) => {
                    if (Array.isArray(data)) setRealtimeMessages(data);
                    socket.emit("chat:read", {
                      conversation_id: res.conversation_id,
                    });
                    loadConversations();
                  });
              } else {
                socket.emit("chat:read", {
                  conversation_id: res.conversation_id,
                });
                loadConversations();
              }
            }
          },
        );
      }

      return () => {
        socket.off("chat:message", handleMessage);
        socket.off("chat:typing");
      };
    }
  }, [isRealtime, isOpen, convId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, realtimeMessages, isTyping]);

  const clearPendingImage = useCallback(() => {
    revokePreviewUrl(pendingImage?.previewUrl);
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [pendingImage]);

  const uploadImage = async () => {
    const currentToken = getToken();
    if (!currentToken || !pendingImage) return null;

    setUploading(true);
    try {
      return await uploadChatImage(currentToken, pendingImage.file);
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    const textToSend = input.trim();
    if (!textToSend && !pendingImage) return;
    if (loading || uploading) return;

    if (isRealtime) {
      const currentToken = getToken();
      if (!currentToken) return;

      const socket = getSocket(currentToken);
      
      try {
        let finalConvId = convId;
        
        if (!finalConvId) {
          const res: { conversation_id?: number } | undefined = await new Promise((resolve) => {
            socket.emit("chat:join", {}, (r: { conversation_id?: number } | undefined) => resolve(r));
          });
          if (res && res.conversation_id) {
            setConvId(res.conversation_id);
            finalConvId = res.conversation_id;
          }
        }

        if (finalConvId) {
          if (textToSend) {
            socket.emit("chat:send", {
              conversation_id: finalConvId,
              content: textToSend,
              message_type: "TEXT",
            });
            setInput("");
            if (textareaRef.current) textareaRef.current.style.height = "40px";
          }

          if (pendingImage) {
            const imageUrl = await uploadImage();
            if (imageUrl) {
              socket.emit("chat:send", {
                conversation_id: finalConvId,
                content: imageUrl,
                message_type: "IMAGE",
              });
            }
            clearPendingImage();
          }

          socket.emit("chat:typing", {
            conversation_id: finalConvId,
            is_typing: false,
          });
        }
      } catch {
        // Keep the current UI unchanged if realtime send fails.
      }
      return;
    }

    if (!textToSend) return;
    const userMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendAiChatMessage(sessionId, userMsg.content);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          recommended_tours: data.recommended_tours,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hệ thống AI đang bận, vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImage({
        file,
        previewUrl: createPreviewUrl(file),
      });
    }
  };

  const hasToken = typeof window !== "undefined" && !!getToken();

  if (pathname?.startsWith("/admin")) return null;

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans text-slate-900">
      {isOpen ? (
        <div className="w-[340px] md:w-[400px] h-[600px] bg-[#f8fafc] rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header - Slim Design */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-4 text-white shadow-md relative z-10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                    {isRealtime ? (
                      <MessageSquare size={16} />
                    ) : (
                      <Zap size={16} />
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-blue-600"></div>
                </div>
                <div>
                  <h3 className="font-bold text-[12px] tracking-tight uppercase leading-none">
                    {isRealtime ? "Hỗ trợ trực tuyến" : "Trợ lý ảo Travol"}
                  </h3>
                  <p className="text-[9px] text-blue-100 font-medium opacity-80 uppercase tracking-widest flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                    Đang hoạt động
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex bg-black/15 p-0.5 rounded-xl backdrop-blur-sm border border-white/5">
              <button
                onClick={() => setIsRealtime(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${!isRealtime ? "bg-white text-blue-600 shadow-sm" : "text-white/60 hover:text-white"}`}
              >
                <Bot size={12} /> AI Bot
              </button>
              <button
                onClick={() => setIsRealtime(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${isRealtime ? "bg-white text-blue-600 shadow-sm" : "text-white/60 hover:text-white"}`}
              >
                <User size={12} /> Nhân viên
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden bg-[#f8fafc] flex flex-col gap-1">
            {!isRealtime ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 mb-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role !== "user" && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex-shrink-0 flex items-center justify-center text-white shadow-md mt-1">
                      <Zap size={16} />
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%] min-w-0`}>
                    <div className={`px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] w-fit max-w-full ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                    {msg.recommended_tours && msg.recommended_tours.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2 w-full">
                        {msg.recommended_tours.map((tour) => (
                          <Link key={tour.tour_id} href={`/tours/${tour.tour_id}`} className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={tour.image_url || CHAT_IMAGE_PLACEHOLDER} alt={tour.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className="text-[11px] font-bold text-slate-800 truncate">{tour.name}</h4>
                              <span className="text-[11px] font-black text-blue-600">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.price)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : hasToken ? (
              realtimeMessages.map((msg, idx) => {
                const isMe = msg.sender_role === "USER";
                const prevMsg = realtimeMessages[idx - 1];
                const nextMsg = realtimeMessages[idx + 1];
                
                const isFirstInGroup = !prevMsg || prevMsg.sender_role !== msg.sender_role;
                const isLastInGroup = !nextMsg || nextMsg.sender_role !== msg.sender_role;

                return (
                  <div key={idx} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${isLastInGroup ? "mb-3" : "mb-0.5"} max-w-full`}>
                    {!isMe && (
                      <div className="w-8 h-8 shrink-0">
                        {isFirstInGroup ? (
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm mt-1">
                            <User size={16} />
                          </div>
                        ) : null}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] min-w-0`}>
                      <div className={`shadow-sm transition-all overflow-hidden ${
                        isMe 
                          ? `bg-blue-600 text-white ${isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"} ${isLastInGroup ? "rounded-bl-2xl rounded-br-none" : "rounded-l-lg"}`
                          : `bg-white text-slate-700 border border-slate-100 ${isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"} ${isLastInGroup ? "rounded-br-2xl rounded-bl-none" : "rounded-r-lg"}`
                      } ${msg.message_type === "IMAGE" ? (isMe ? "p-0 overflow-hidden bg-transparent border-none shadow-none" : "p-1") : "px-4 py-2.5 text-[13px] font-medium"}`}>
                        {msg.message_type === "IMAGE" ? (
                          <img src={msg.content} alt="Chat" className="max-h-60 max-w-full rounded-xl object-contain" />
                        ) : (
                          <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] w-fit max-w-full leading-relaxed">
                            {msg.content}
                          </div>
                        )}
                      </div>
                      {isLastInGroup && (
                        <span className="text-[9px] text-slate-400 mt-1 font-bold px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4">
                  <User size={32} />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Đăng nhập để chat</h4>
                <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200">Đăng nhập ngay</Link>
              </div>
            )}

            {loading && !isRealtime && (
              <div className="flex gap-1 ml-10 mb-4">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}

            {isRealtime && isTyping && (
              <div className="flex items-center ml-10 mb-4">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Nhân viên đang soạn...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            {pendingImage && (
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-blue-50 bg-blue-50/30 p-2 relative animate-in slide-in-from-bottom-2">
                <img src={pendingImage.previewUrl} alt="Pending" className="h-12 w-12 rounded-xl object-cover shadow-sm" />
                <div className="flex-1 min-w-0 text-[11px] font-bold text-slate-700 truncate">{pendingImage.file.name}</div>
                <button onClick={clearPendingImage} className="p-1.5 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 rounded-[24px] p-1.5 pl-4 border border-slate-200 focus-within:bg-white transition-all">
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading || !isRealtime || !hasToken} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-[#f8fafc] hover:text-blue-600 transition-all border border-slate-100">
                <ImageIcon size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

              <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 min-h-[40px] max-h-32 resize-none bg-transparent py-2 text-[13px] leading-5 focus:outline-none placeholder:text-slate-400 font-medium"
                placeholder={uploading ? "Đang xử lý..." : isRealtime ? "Nhắn tin..." : "Hỏi trợ lý ảo..."}
                value={input}
                disabled={uploading}
                onChange={(e) => {
                  const val = e.target.value;
                  setInput(val);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                  const currentToken = getToken();
                  if (isRealtime && currentToken && convId) {
                    getSocket(currentToken).emit("chat:typing", { conversation_id: convId, is_typing: val.length > 0 });
                  }
                }}
                onKeyDown={handleTextareaKeyDown}
              />
              <button onClick={(e) => { e.preventDefault(); sendMessage(); }} disabled={(loading && !isRealtime) || (!input.trim() && !pendingImage) || uploading} className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-200 disabled:opacity-20 cursor-pointer">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-[22px] shadow-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-300 group relative border-4 border-white">
          <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          {conversations.some((c) => c.unread_count > 0) && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black shadow-lg text-white animate-bounce">
              {conversations.reduce((acc, c) => acc + c.unread_count, 0)}
            </div>
          )}
        </button>
      )}
    </div>
  );
};
