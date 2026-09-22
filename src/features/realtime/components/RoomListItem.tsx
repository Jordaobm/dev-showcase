"use client";

import { Hash, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ChatRoom } from "../services/api";

interface RoomListItemProps {
  room: ChatRoom;
  selected: boolean;
  onClick: () => void;
}

export const RoomListItem = ({
  room,
  selected,
  onClick,
}: Readonly<RoomListItemProps>) => {
  const t = useTranslations("realtime");
  const urgent = room.expiresInDays <= 2;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
        selected ? "bg-red-50 ring-1 ring-red-200" : "hover:bg-black/[0.03]"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
            selected ? "bg-[var(--premium-red)] text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          <Hash className="w-2.5 h-2.5" strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          <span
            className={`block text-[13px] font-semibold truncate ${
              selected ? "text-[var(--premium-red)]" : "text-gray-800"
            }`}
          >
            {room.name}
          </span>

          {room.lastMessage && (
            <p className="text-[11px] text-gray-400 truncate leading-snug mt-0.5 mb-1.5">
              {room.lastMessage}
            </p>
          )}

          <div className="flex items-center gap-1.5">
            {room.expiresInDays <= 1 ? (
              <span className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-red-100 text-[var(--premium-red)]">
                {t("chatSidebarExpiresToday")}
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-medium rounded-full px-2 py-0.5 bg-gray-100 text-gray-500">
                {t("chatSidebarExpiresInDays", { count: room.expiresInDays })}
              </span>
            )}
            <div className="flex items-center gap-0.5 ml-auto">
              <Users className="w-2.5 h-2.5 text-gray-400" />
              <span
                className={`text-[10px] tabular-nums ${
                  urgent ? "text-[var(--premium-red)] font-semibold" : "text-gray-400"
                }`}
              >
                {room.participantCount}/{room.maxParticipants}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
