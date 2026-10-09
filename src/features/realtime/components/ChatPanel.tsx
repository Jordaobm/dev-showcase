"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Clock, Copy, Hash, Lock, Plus, Send, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MAX_MESSAGE_LENGTH } from "../services/api";
import type { ChatMessage, ChatParticipant, ChatRoom } from "../services/api";
import { MessageBubble } from "./MessageBubble";
import { ParticipantAvatar } from "./ParticipantAvatar";

interface ChatPanelProps {
  room: ChatRoom | null;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  shareLink: string | null;
  notice?: string | null;
  onDeleteRoom?: () => void;
  onSendMessage: (content: string) => void;
  onCreateRoom: () => void;
  onBackToSidebar: () => void;
}

const COUNTER_THRESHOLD = Math.floor(MAX_MESSAGE_LENGTH * 0.8);

export const ChatPanel = ({
  room,
  messages,
  participants,
  shareLink,
  notice,
  onDeleteRoom,
  onSendMessage,
  onCreateRoom,
  onBackToSidebar,
}: Readonly<ChatPanelProps>) => {
  const t = useTranslations("realtime");
  const [value, setValue] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!value.trim()) return;
    onSendMessage(value.trim());
    setValue("");
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
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
          {notice && (
            <p
              role="status"
              className="mb-6 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800"
            >
              {notice}
            </p>
          )}
          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2 rounded-full text-white text-sm font-semibold px-5 py-2.5 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)" }}
          >
            <Plus className="w-4 h-4" /> {t("chatSidebarCreateRoom")}
          </button>
        </div>
      </div>
    );
  }

  const participantNames = participants
    .map((p) => (p.isOnline ? `${p.name} (${t("chatParticipantOnline")})` : p.name))
    .join(", ");
  const onlineCount = participants.filter((p) => p.isOnline).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <div className="flex-shrink-0 h-[52px] flex items-center gap-3 px-4 md:px-6 border-b border-gray-100 bg-white">
        <button
          onClick={onBackToSidebar}
          className="md:hidden text-gray-400 hover:text-gray-600 cursor-pointer"
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
        <div
          className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400"
          title={participantNames}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {t("chatPanelOnlineCount", { count: onlineCount })}
        </div>
        {shareLink && (
          <button
            onClick={handleCopyShareLink}
            title={t("chatPanelCopyLink")}
            aria-label={t("chatPanelCopyLink")}
            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              linkCopied
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
        {onDeleteRoom && (
          <button
            onClick={onDeleteRoom}
            title={t("chatDeleteRoomButton")}
            aria-label={t("chatDeleteRoomButton")}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="flex -space-x-2" title={participantNames}>
          {participants.slice(0, 5).map((p) => (
            <div key={p.id} className="ring-2 ring-white rounded-full">
              <ParticipantAvatar name={p.name} size="sm" showPresence online={p.isOnline} />
            </div>
          ))}
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
        <div className="max-w-[640px] mx-auto">
          {messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              grouped={i > 0 && messages[i - 1].senderId === m.senderId}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-gray-100 bg-white">
        <div className="max-w-[640px] mx-auto flex items-end gap-2 pl-4 pr-2 py-2 bg-gray-50 border-2 border-gray-200 rounded-2xl focus-within:border-red-400 transition-colors">
          <textarea
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
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
              value.trim()
                ? "text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            style={value.trim() ? { background: "var(--premium-red)" } : undefined}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="max-w-[640px] mx-auto mt-1.5 flex items-center justify-center gap-3 text-[10px] text-gray-400">
          <p title={t("chatPanelEncryptedTip")} className="flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            {t("chatPanelEncryptedNote")}
          </p>
          {value.length >= COUNTER_THRESHOLD && (
            <span
              aria-live="polite"
              className={value.length >= MAX_MESSAGE_LENGTH ? "text-red-500 font-semibold" : undefined}
            >
              {value.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
