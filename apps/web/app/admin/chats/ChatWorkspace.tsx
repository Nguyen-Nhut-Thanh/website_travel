"use client";

import type { RefObject } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  MoreVertical,
  SendHorizontal,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatMessageTime } from "@/lib/chat";
import type { Conversation, PendingImage, RealtimeMessage } from "@/types/chat";

type ChatWorkspaceProps = {
  selectedId: number | null;
  selectedConversation: Conversation | null;
  messages: RealtimeMessage[];
  loadingMessages: boolean;
  input: string;
  sending: boolean;
  pendingImage: PendingImage | null;
  showMenu: boolean;
  showDeleteConfirm: boolean;
  activeTyping: boolean;
  lightboxUrl: string | null;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onPickImage: () => void;
  onFileChange: (file: File | null) => void;
  onClearPendingImage: () => void;
  onToggleMenu: () => void;
  onOpenDeleteConfirm: () => void;
  onCloseDeleteConfirm: () => void;
  onDeleteConversation: () => void;
  onOpenLightbox: (url: string) => void;
  onCloseLightbox: () => void;
};

export function ChatWorkspace({
  selectedId,
  selectedConversation,
  messages,
  loadingMessages,
  input,
  sending,
  pendingImage,
  showMenu,
  showDeleteConfirm,
  activeTyping,
  lightboxUrl,
  textareaRef,
  fileInputRef,
  bottomRef,
  onBack,
  onInputChange,
  onSend,
  onPickImage,
  onFileChange,
  onClearPendingImage,
  onToggleMenu,
  onOpenDeleteConfirm,
  onCloseDeleteConfirm,
  onDeleteConversation,
  onOpenLightbox,
  onCloseLightbox,
}: ChatWorkspaceProps) {
  return (
    <main
      className={`${
        !selectedId ? "hidden md:flex" : "flex"
      } flex-1 flex-col bg-[#f1f5f9]/30`}
    >
      {selectedConversation ? (
        <div className="relative flex h-full flex-col">
          <div className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 md:hidden"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="relative shrink-0">
                {selectedConversation.users?.avatar_url ? (
                  <img
                    src={selectedConversation.users.avatar_url}
                    alt={selectedConversation.users.full_name}
                    className="h-9 w-9 rounded-full border border-slate-100 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <UserIcon size={16} />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[14px] font-black tracking-tight text-slate-900">
                  {selectedConversation.users?.full_name || "Khách hàng"}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  {activeTyping ? "Đang soạn..." : "Trực tuyến"}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={onToggleMenu}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  showMenu
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                <MoreVertical size={18} />
              </button>

              {showMenu ? (
                <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5 duration-100">
                  <button
                    type="button"
                    onClick={onOpenDeleteConfirm}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 size={16} />
                    Xóa cuộc trò chuyện
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-10">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="mx-auto flex flex-col gap-1">
                {messages.map((message, index) => {
                  const isAdmin = message.sender_role !== "USER";
                  const prevMessage = messages[index - 1];
                  const nextMessage = messages[index + 1];
                  const isFirstInGroup =
                    !prevMessage ||
                    prevMessage.sender_role !== message.sender_role;
                  const isLastInGroup =
                    !nextMessage ||
                    nextMessage.sender_role !== message.sender_role;

                  return (
                    <div
                      key={message.message_id}
                      className={`flex gap-3 ${
                        isAdmin ? "justify-end" : "justify-start"
                      } ${isLastInGroup ? "mb-4" : "mb-0.5"}`}
                    >
                      {!isAdmin ? (
                        <div className="h-8 w-8 shrink-0">
                          {isFirstInGroup ? (
                            selectedConversation.users?.avatar_url ? (
                              <img
                                src={selectedConversation.users.avatar_url}
                                alt={selectedConversation.users.full_name}
                                className="h-full w-full rounded-full border border-slate-100 object-cover shadow-sm"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-500">
                                <UserIcon size={14} />
                              </div>
                            )
                          ) : null}
                        </div>
                      ) : null}

                      <div
                        className={`flex max-w-[75%] flex-col ${
                          isAdmin ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`shadow-sm ${
                            isAdmin
                              ? `bg-blue-600 text-white ${
                                  isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"
                                } ${
                                  isLastInGroup
                                    ? "rounded-bl-2xl rounded-br-none"
                                    : "rounded-l-lg"
                                }`
                              : `border border-slate-100 bg-white text-slate-800 ${
                                  isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"
                                } ${
                                  isLastInGroup
                                    ? "rounded-br-2xl rounded-bl-none"
                                    : "rounded-r-lg"
                                }`
                          } ${
                            message.message_type === "IMAGE"
                              ? isAdmin
                                ? "overflow-hidden bg-transparent p-0 shadow-none"
                                : "p-1"
                              : "px-4 py-2 text-[13.5px] font-medium leading-relaxed"
                          }`}
                        >
                          {message.message_type === "IMAGE" ? (
                            <button
                              type="button"
                              onClick={() => onOpenLightbox(message.content)}
                              className="block overflow-hidden rounded-xl"
                            >
                              <img
                                src={message.content}
                                alt="Nội dung"
                                className="max-h-[350px] w-full object-contain"
                              />
                            </button>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}
                        </div>

                        {isLastInGroup ? (
                          <span className="mt-1 px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            {formatMessageTime(message.created_at)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} className="h-2" />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mx-auto w-full max-w-5xl">
              {pendingImage ? (
                <div className="mb-3 flex items-center gap-3 rounded-2xl border border-blue-50 bg-blue-50/30 p-2.5">
                  <img
                    src={pendingImage.previewUrl}
                    alt="Ảnh chờ gửi"
                    className="h-14 w-14 rounded-xl object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-black text-slate-900">
                      {pendingImage.file.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClearPendingImage}
                    className="rounded-full bg-white p-1.5 text-slate-400 shadow-sm hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onPickImage}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition-all hover:bg-[#f8fafc] hover:text-blue-600"
                >
                  <ImageIcon size={22} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(event) =>
                    onFileChange(event.target.files?.[0] ?? null)
                  }
                />

                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 transition-colors focus-within:bg-slate-200/50">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        onSend();
                      }
                    }}
                    placeholder="Nhập phản hồi..."
                    className="w-full resize-none bg-transparent py-2.5 text-[13px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={onSend}
                  disabled={(!input.trim() && !pendingImage) || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none"
                >
                  {sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <SendHorizontal size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <ConfirmDialog
            open={showDeleteConfirm}
            icon={<AlertTriangle size={32} />}
            title="Xóa hội thoại?"
            description="Hành động này sẽ xóa vĩnh viễn toàn bộ tin nhắn. Bạn không thể hoàn tác sau khi xác nhận."
            confirmLabel="Xác nhận xóa"
            cancelLabel="Hủy bỏ"
            onConfirm={onDeleteConversation}
            onCancel={onCloseDeleteConfirm}
          />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.04),_transparent_40%)] p-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-blue-100 shadow-xl shadow-blue-900/5">
            <MessageSquare size={38} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">
            Trung tâm hỗ trợ
          </h3>
          <p className="mt-2 max-w-[240px] text-[13px] font-medium leading-relaxed text-slate-400">
            Hệ thống sẵn sàng. Vui lòng chọn một khách hàng để bắt đầu tư vấn.
          </p>
        </div>
      )}

      {lightboxUrl ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={onCloseLightbox}
        >
          <img
            src={lightboxUrl}
            alt="Xem trước"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      ) : null}
    </main>
  );
}
