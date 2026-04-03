"use client";

import { Loader2, RefreshCcw, Search, User as UserIcon } from "lucide-react";
import {
  formatConversationTime,
  getConversationPreview,
} from "@/lib/chat";
import type { Conversation } from "@/types/chat";

type ConversationSidebarProps = {
  conversations: Conversation[];
  unreadTotal: number;
  selectedId: number | null;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onSelect: (conversationId: number) => void;
};

export function ConversationSidebar({
  conversations,
  unreadTotal,
  selectedId,
  loading,
  searchTerm,
  onSearchChange,
  onRefresh,
  onSelect,
}: ConversationSidebarProps) {
  return (
    <aside
      className={`${
        selectedId ? "hidden md:flex" : "flex"
      } w-full shrink-0 flex-col border-r border-slate-200 bg-white md:w-[280px] lg:w-[320px]`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-[#f8fafc]/50 px-4 backdrop-blur-sm">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
          Hội thoại ({unreadTotal})
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-blue-600"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="p-2.5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            size={14}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm khách..."
            className="h-9 w-full rounded-xl border-none bg-slate-50 pl-9 pr-4 text-[12px] font-medium text-slate-600 outline-none transition focus:bg-slate-100/80"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide">
        {loading && !conversations.length ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : conversations.length ? (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const isActive = conversation.conversation_id === selectedId;
              const isUnread = conversation.unread_count > 0;

              return (
                <button
                  key={conversation.conversation_id}
                  type="button"
                  onClick={() => onSelect(conversation.conversation_id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    {conversation.users?.avatar_url ? (
                      <img
                        src={conversation.users.avatar_url}
                        alt={conversation.users.full_name}
                        className="h-10 w-10 rounded-full border border-white/20 object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <UserIcon size={16} />
                      </div>
                    )}
                    {!isActive ? (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`truncate text-[13px] ${
                          isActive
                            ? "font-bold"
                            : isUnread
                              ? "font-black text-slate-900"
                              : "font-semibold text-slate-800"
                        }`}
                      >
                        {conversation.users?.full_name || "Khách hàng"}
                      </p>
                      <span
                        className={`shrink-0 text-[9px] ${
                          isActive ? "text-white/70" : "opacity-60"
                        }`}
                      >
                        {formatConversationTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-[12px] ${
                          isActive
                            ? "text-white/80"
                            : isUnread
                              ? "font-bold text-slate-800"
                              : "opacity-60"
                        }`}
                      >
                        {getConversationPreview(conversation)}
                      </p>
                      {isUnread && !isActive ? (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                          {conversation.unread_count}
                        </span>
                      ) : null}
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
  );
}
