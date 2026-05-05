"use client";

import { formatDate } from "@/features/shared/utils/formatDate";
import { Trash2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { INote, NOTE_STATUS } from "../types/INote";

interface NotesTableProps {
  notes: INote[];
  showSyncing: boolean;
  onDeleteNote: (id: number) => void;
}

export const NotesTable = ({
  notes,
  showSyncing,
  onDeleteNote,
}: Readonly<NotesTableProps>) => {
  const t = useTranslations();

  if (notes.length === 0) {
    return (
      <div className="mt-4 w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md p-8 text-center">
        <p className="text-gray-600 font-semibold text-lg">
          {t("offlineDataLayer.emptyStateTitle")}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {t("offlineDataLayer.emptyStateHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="px-3 py-3 sm:px-6 text-left text-sm font-semibold text-gray-700">
              {t("offlineDataLayer.tableId")}
            </th>
            <th className="px-3 py-3 sm:px-6 text-left text-sm font-semibold text-gray-700">
              {t("offlineDataLayer.tableNote")}
            </th>
            <th className="px-3 py-3 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
              {t("offlineDataLayer.tableTimestamp")}
            </th>
            <th className="px-3 py-3 sm:px-6 text-left text-sm font-semibold text-gray-700 min-w-32">
              {t("offlineDataLayer.tableStatus")}
            </th>
            <th className="px-3 py-3 sm:px-6 text-left text-sm font-semibold text-gray-700">
              {t("offlineDataLayer.tableActions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr
              key={note.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm text-gray-900">
                {note.id}
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm text-gray-900">
                {note.text}
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                {formatDate(note.timestamp)}
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm text-gray-900">
                <div className="flex items-center gap-2">
                  {note.status === NOTE_STATUS.ONLINE && (
                    <>
                      <motion.div
                        className="w-3 h-3 rounded-full bg-green-500 shrink-0"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-green-600 font-medium">
                        {t("offlineDataLayer.statusOnline")}
                      </span>
                    </>
                  )}
                  {note.status === NOTE_STATUS.OFFLINE && showSyncing && (
                    <>
                      <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                      <span className="text-orange-600 font-medium">
                        {t("offlineDataLayer.statusSyncing")}
                      </span>
                    </>
                  )}
                  {note.status === NOTE_STATUS.OFFLINE && !showSyncing && (
                    <>
                      <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                      <span className="text-red-600 font-medium">
                        {t("offlineDataLayer.statusOffline")}
                      </span>
                    </>
                  )}
                </div>
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <motion.button
                  onClick={() => onDeleteNote(note.id)}
                  aria-label={t("offlineDataLayer.deleteNoteAriaLabel", {
                    id: note.id,
                  })}
                  className="cursor-pointer px-3 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-lg flex items-center justify-center gap-2 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2Icon className="w-4 h-4" />
                </motion.button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
