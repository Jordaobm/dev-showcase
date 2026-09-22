"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock, Hash, Plus, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ChatParticipant } from "../services/mockApi";
import type { ChatMessage, ChatRoom } from "../services/api";
import { MessageBubble } from "./MessageBubble";
import { ParticipantAvatar } from "./ParticipantAvatar";

interface ChatPanelProps {
  room: ChatRoom | null;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  onSendMessage: (content: string) => void;
  onCreateRoom: () => void;
  onBackToSidebar: () => void;
}

export const ChatPanel = ({
  room,
  messages,
  participants,
  onSendMessage,
  onCreateRoom,
  onBackToSidebar,
}: Readonly<ChatPanelProps>) => {
  const t = useTranslations("realtime");
  const [value, setValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!value.trim()) return;
    onSendMessage(value.trim());
    setValue("");
  };

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 h-full">
        <div className="w-full max-w-[420px] border border-dashed border-gray-300 rounded-2xl bg-white/60 px-8 py-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-2">
            {t("chatPanelEmptyTitle")}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {t("chatPanelEmptyDesc")}
          </p>
          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2 rounded-full text-white text-sm font-semibold px-5 py-2.5"
            style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)" }}
          >
            <Plus className="w-4 h-4" /> {t("chatSidebarCreateRoom")}
          </button>
        </div>
      </div>
    );
  }

  const onlineCount = participants.filter((p) => p.isOnline).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <div className="flex-shrink-0 h-[52px] flex items-center gap-3 px-4 md:px-6 border-b border-gray-100 bg-white">
        <button
          onClick={onBackToSidebar}
          className="md:hidden text-gray-400 hover:text-gray-600"
          aria-label={t("chatPanelBackToRooms")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <Hash className="w-3.5 h-3.5 text-[var(--premium-red)]" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">{room.name}</p>
          <p
            className={`text-[10px] ${
              room.expiresInDays <= 2 ? "text-[var(--premium-red)] font-semibold" : "text-gray-400"
            }`}
          >
            {t("chatPanelExpiresIn", { count: room.expiresInDays })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {t("chatPanelOnlineCount", { count: onlineCount })}
        </div>
        <div className="flex -space-x-2">
          {participants.slice(0, 5).map((p) => (
            <div key={p.id} className="ring-2 ring-white rounded-full">
              <ParticipantAvatar name={p.name} size="sm" showPresence online={p.isOnline} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
        <div className="max-w-[640px] mx-auto">
          {messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              grouped={i > 0 && messages[i - 1].senderId === m.senderId}
            />
          ))}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-gray-100 bg-white">
        <div className="max-w-[640px] mx-auto flex items-end gap-2 pl-4 pr-2 py-2 bg-gray-50 border-2 border-gray-200 rounded-2xl focus-within:border-red-400 transition-colors">
          <textarea
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("chatPanelInputPlaceholder", { room: room.name })}
            aria-label={t("chatPanelInputPlaceholder", { room: room.name })}
            className="flex-1 py-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            aria-label={t("chatPanelSendButton")}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              value.trim() ? "text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            style={value.trim() ? { background: "var(--premium-red)" } : undefined}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
