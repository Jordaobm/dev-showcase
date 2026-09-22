"use client";

import { useState } from "react";
import { Link2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ChatRoom } from "../services/api";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { RoomListItem } from "./RoomListItem";

interface RoomSidebarProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  username: string;
  onSelectRoom: (id: string) => void;
  onCreateRoom: () => void;
  onJoinByLink: (link: string) => void;
  onLogout: () => void;
  isJoining: boolean;
}

export const RoomSidebar = ({
  rooms,
  selectedRoomId,
  username,
  onSelectRoom,
  onCreateRoom,
  onJoinByLink,
  onLogout,
  isJoining,
}: Readonly<RoomSidebarProps>) => {
  const t = useTranslations("realtime");
  const [joinValue, setJoinValue] = useState("");

  const handleJoin = () => {
    if (!joinValue.trim()) return;
    onJoinByLink(joinValue.trim());
    setJoinValue("");
  };

  return (
    <aside className="w-full md:w-[260px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-gray-50 h-full">
      <div className="p-3 space-y-2 border-b border-gray-100">
        <button
          onClick={onCreateRoom}
          className="w-full flex items-center justify-center gap-2 rounded-full text-white text-sm font-semibold px-4 py-2.5 transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)" }}
        >
          <Plus className="w-4 h-4" /> {t("chatSidebarCreateRoom")}
        </button>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={joinValue}
            onChange={(e) => setJoinValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder={t("chatSidebarJoinPlaceholder")}
            aria-label={t("chatSidebarJoinPlaceholder")}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white border-2 border-gray-200 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-red-400 transition-colors"
          />
          <button
            onClick={handleJoin}
            disabled={isJoining || !joinValue.trim()}
            title={t("chatSidebarJoinButton")}
            aria-label={t("chatSidebarJoinButton")}
            className="flex-shrink-0 w-9 rounded-xl bg-white border-2 border-gray-200 text-gray-500 flex items-center justify-center hover:border-gray-300 disabled:opacity-50 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {rooms.length > 0 && (
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-2 mb-1.5">
              {t("chatSidebarMyRooms")}
            </p>
            <div className="space-y-0.5">
              {rooms.map((r) => (
                <RoomListItem
                  key={r.id}
                  room={r}
                  selected={r.id === selectedRoomId}
                  onClick={() => onSelectRoom(r.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ParticipantAvatar name={username} size="sm" />
          <span className="text-xs font-semibold text-gray-700 truncate">
            {username}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-[11px] text-gray-400 hover:text-gray-600 font-medium flex-shrink-0"
        >
          {t("chatWorkspaceLogout")}
        </button>
      </div>
    </aside>
  );
};
