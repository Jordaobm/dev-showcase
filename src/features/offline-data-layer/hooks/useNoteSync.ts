import { useState } from "react";
import { NOTE_STATUS, RETRY_REQUESTS } from "../types/INote";
import { useOnlineSync } from "./useOnlineSync";

interface NoteStorage {
  save: (text: string, status: keyof typeof NOTE_STATUS) => Promise<void>;
  del: (id: number) => Promise<void>;
}

export const useNoteSync = ({ save, del }: Readonly<NoteStorage>) => {
  const [syncUnsupported, setSyncUnsupported] = useState(false);
  const { showSyncing, refetch, isPending } = useOnlineSync();

  const onCreateNote = async (text: string) => {
    const { data: freshStatus } = await refetch();
    const status = freshStatus?.data?.online
      ? NOTE_STATUS.ONLINE
      : NOTE_STATUS.OFFLINE;

    await save(text, status as keyof typeof NOTE_STATUS);

    if (status === NOTE_STATUS.OFFLINE) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if ("sync" in reg) {
          await reg.sync.register(RETRY_REQUESTS);
        } else {
          setSyncUnsupported(true);
        }
      } catch {
        setSyncUnsupported(true);
      }
    }
  };

  const onDeleteNote = async (id: number) => {
    await refetch();
    del(id);
  };

  return {
    onCreateNote,
    onDeleteNote,
    syncUnsupported,
    showSyncing,
    isPending,
  };
};
