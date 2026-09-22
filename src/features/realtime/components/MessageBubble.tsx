import type { ChatMessage } from "../services/api";
import { ParticipantAvatar } from "./ParticipantAvatar";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

interface MessageBubbleProps {
  message: ChatMessage;
  grouped: boolean;
}

export const MessageBubble = ({ message, grouped }: MessageBubbleProps) => {
  if (message.isMine) {
    return (
      <div className={`flex flex-col items-end ${grouped ? "mt-1" : "mt-4"}`}>
        <div
          className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-md text-white"
          style={{ background: "var(--premium-red)" }}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          <p className="text-[10px] text-white/70 mt-1 text-right">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${grouped ? "mt-1" : "mt-4"}`}>
      {!grouped ? (
        <ParticipantAvatar name={message.senderName} size="sm" />
      ) : (
        <div className="w-6 flex-shrink-0" />
      )}
      <div className="max-w-[70%]">
        {!grouped && (
          <p className="text-[11px] font-semibold text-gray-500 mb-1 ml-0.5">
            {message.senderName}
          </p>
        )}
        <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-800 leading-relaxed">
            {message.content}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};
