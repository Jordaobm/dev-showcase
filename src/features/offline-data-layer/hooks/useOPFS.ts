import { useCallback, useEffect, useRef, useState } from "react";
import { INote, NOTE_STATUS, SYNC_COMPLETED } from "../types/INote";

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

type WorkerMessage =
  | { type: "init" }
  | { type: "read" }
  | { type: "save"; text: string; status: keyof typeof NOTE_STATUS }
  | { type: "delete"; noteId: number }
  | { type: "update"; noteId: number; status: string };

interface UseOPFSReturn {
  save: (text: string, status: keyof typeof NOTE_STATUS) => Promise<void>;
  data: INote[];
  del: (id: number) => Promise<void>;
  initError: boolean;
}

export const useOPFS = (): UseOPFSReturn => {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());
  const [data, setData] = useState<INote[]>([]);
  const [initError, setInitError] = useState(false);

  const sendMessage = useCallback(
    (message: WorkerMessage): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        const worker = workerRef.current;
        if (!worker) return reject(new Error("OPFS Worker not initialized"));
        const id = crypto.randomUUID();
        pendingRef.current.set(id, { resolve, reject });
        worker.postMessage({ ...message, id });
      });
    },
    [],
  );

  const read = useCallback(async () => {
    const response = await sendMessage({ type: "read" });
    setData((response as { rows: INote[] }).rows);
  }, [sendMessage]);

  const sync = useCallback(async () => {
    const response = await sendMessage({ type: "read" });
    const offlineNotes = (response as { rows: INote[] }).rows.filter(
      (n) => n.status === NOTE_STATUS.OFFLINE,
    );

    for (const note of offlineNotes) {
      await sendMessage({
        type: "update",
        noteId: note.id,
        status: NOTE_STATUS.ONLINE,
      });
    }

    await read();
  }, [sendMessage, read]);

  const save = useCallback(
    async (text: string, status: keyof typeof NOTE_STATUS) => {
      await sendMessage({ type: "save", text, status });
      await read();
    },
    [sendMessage, read],
  );

  const del = useCallback(
    async (id: number) => {
      await sendMessage({ type: "delete", noteId: id });
      await read();
    },
    [sendMessage, read],
  );

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/opfs.worker.ts", import.meta.url),
    );
    workerRef.current = worker;

    worker.addEventListener("message", (event: MessageEvent) => {
      const { id, error, ...rest } = event.data;
      const pending = pendingRef.current.get(id);
      if (!pending) return;
      pendingRef.current.delete(id);
      if (error) pending.reject(new Error(error));
      else pending.resolve(rest);
    });

    sendMessage({ type: "init" })
      .then(() => read())
      .catch(() => setInitError(true));

    const pendingMap = pendingRef.current;
    return () => {
      for (const pending of pendingMap.values()) {
        pending.reject(new Error("Worker terminated"));
      }
      pendingMap.clear();
      worker.terminate();
      workerRef.current = null;
    };
  }, [sendMessage, read]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === SYNC_COMPLETED) {
        sync();
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, [sync]);

  return { save, del, data, initError };
};
