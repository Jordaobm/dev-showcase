"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeleteRoomModalProps {
  roomName: string;
  isDeleting: boolean;
  hasError: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteRoomModal = ({
  roomName,
  isDeleting,
  hasError,
  onCancel,
  onConfirm,
}: Readonly<DeleteRoomModalProps>) => {
  const t = useTranslations("realtime");

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("chatDeleteRoomTitle")}
        className="relative w-full max-w-[380px] mx-4 bg-white rounded-2xl shadow-xl px-6 py-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-extrabold text-gray-900">{t("chatDeleteRoomTitle")}</h4>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            aria-label={t("chatCreateRoomClose")}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {t("chatDeleteRoomDesc", { name: roomName })}
        </p>
        {hasError && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {t("chatDeleteRoomError")}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 hover:border-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("chatDeleteRoomCancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 rounded-full text-white text-sm font-semibold px-4 py-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)" }}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {t("chatDeleteRoomConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
