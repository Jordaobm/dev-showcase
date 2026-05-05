import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/components/Button";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalNoteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: string) => void;
  isLoading?: boolean;
}

const FOCUSABLE_SELECTOR =
  'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])';

export const ModalNote = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ModalNoteProps) => {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [mounted] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const container = dialogRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable.at(-1)!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-note-title"
              className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <motion.div
                className="p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <h2 id="modal-note-title" className="text-xl font-bold">
                  {t("offlineDataLayer.modalTitle")}
                </h2>

                <div className="mt-6">
                  <div className="flex-1 w-full">
                    <label htmlFor="note" className="text-sm text-gray-700">
                      {t("offlineDataLayer.modalNoteLabel")}
                    </label>
                    <input
                      ref={inputRef}
                      id="note"
                      type="text"
                      placeholder={t("offlineDataLayer.modalNotePlaceholder")}
                      className="mt-2 w-full pl-4 pr-4 py-2.5 rounded-xl bg-white/60 border-2 border-gray/40
                             focus:outline-none focus:bg-white focus:border-[var(--premium-red)]
                             transition-all duration-300 backdrop-blur-sm text-sm"
                      style={{
                        boxShadow:
                          "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button type="secondary" onClick={onClose}>
                    {t("offlineDataLayer.modalCancelButton")}
                  </Button>

                  <Button
                    type="primary"
                    disabled={isLoading}
                    onClick={() => onSubmit(inputRef.current?.value ?? "")}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>{t("offlineDataLayer.modalConfirmButton")}</>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
