import { useEffect, useState } from "react";
import { INote, NOTE_STATUS, SYNC_COMPLETED } from "../types/INote";
import { readNotes, saveNote, deleteNote } from "../services/indexDB";

interface UseIndexDBReturn {
  save: (text: string, status: keyof typeof NOTE_STATUS) => Promise<void>;
  data: INote[];
  del: (id: number) => Promise<void>;
}

export const useIndexDB = (): UseIndexDBReturn => {
  const [data, setData] = useState<INote[]>([]);

  const read = async () => {
    const notes = await readNotes();
    setData(notes);
  };

  const save = async (text: string, status: keyof typeof NOTE_STATUS) => {
    await saveNote(text, status);
    await read();
  };

  const del = async (id: number) => {
    await deleteNote(id);
    await read();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    read();
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === SYNC_COMPLETED) {
        read();
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, []);

  return { save, data, del };
};
