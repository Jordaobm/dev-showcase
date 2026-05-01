import { INote, NOTE_STATUS } from "../types/INote";

export const dbName = "dev_showcase";
const DB_VERSION = 1;
const STORE_NAME = "notes";

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        store.createIndex("text", "text", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error(request.error?.message ?? "IndexedDB request error"));
  });
};

export const readNotes = async (): Promise<INote[]> => {
  const db = await openDB();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
};

export const saveNote = async (
  text: string,
  status: keyof typeof NOTE_STATUS,
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.add({ text, timestamp: Date.now(), status });

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(new Error(tx.error?.message ?? "IndexedDB transaction error"));
  });
};

export const deleteNote = async (id: number): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(new Error(tx.error?.message ?? "IndexedDB transaction error"));
  });
};

export const updateNote = async (note: INote): Promise<boolean> => {
  const db = await openDB();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put(note);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
};
