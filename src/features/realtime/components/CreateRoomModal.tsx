"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
  createdRoomLink: string | null;
  isCreating: boolean;
}

export const CreateRoomModal = ({
  onClose,
  onCreate,
  createdRoomLink,
  isCreating,
}: Readonly<CreateRoomModalProps>) => {
  const t = useTranslations("realtime");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!createdRoomLink) return;
    await navigator.clipboard.writeText(createdRoomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[380px] mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-red-600 to-orange-600" />
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-extrabold text-gray-900">
              {t("chatCreateRoomTitle")}
            </h4>
            <button
              onClick={onClose}
              aria-label={t("chatCreateRoomClose")}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!createdRoomLink ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) onCreate(name.trim());
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  {t("chatCreateRoomNameLabel")}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("chatCreateRoomNamePlaceholder")}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-400 transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  {t("chatCreateRoomRules")}
                </p>
              </div>
              <button
                type="submit"
                disabled={!name.trim() || isCreating}
                className="w-full rounded-full text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)" }}
              >
                {isCreating
                  ? t("chatCreateRoomCreating")
                  : t("chatCreateRoomSubmit")}
              </button>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-gray-800">
                  {t("chatCreateRoomSuccess")}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <p className="text-xs text-gray-600 flex-1 truncate font-mono">
                  {createdRoomLink}
                </p>
                <button
                  onClick={handleCopy}
                  aria-label={t("chatCreateRoomCopy")}
                  className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    copied
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-white border border-gray-200 text-gray-500"
                  }`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-full border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                {t("chatCreateRoomGoToRoom")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
