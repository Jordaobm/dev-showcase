import * as SQLite from "wa-sqlite";
import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite.mjs";
// @ts-expect-error — no type declarations for this internal wa-sqlite example file
import { AccessHandlePoolVFS } from "wa-sqlite/src/examples/AccessHandlePoolVFS.js";
import { INote, NOTE_STATUS } from "../types/INote";

const DB_NAME = "dev_showcase.db";
const VFS_NAME = "AccessHandlePool";
const VFS_DIRECTORY = "/dev-showcase-opfs";
const OPEN_FLAGS = SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE;

let sqlite3: ReturnType<typeof SQLite.Factory> | null = null;
let initPromise: Promise<void> | null = null;

const performInit = async (): Promise<void> => {
  const wasmModule = await SQLiteESMFactory();
  sqlite3 = SQLite.Factory(wasmModule);

  const vfs = new AccessHandlePoolVFS(VFS_DIRECTORY);
  await vfs.isReady;
  sqlite3.vfs_register(vfs, false);

  const db = await openDb();
  await sqlite3.exec(
    db,
    `CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      timestamp INTEGER,
      status TEXT
    );`,
  );
  await sqlite3.close(db);
};

const ensureInit = async (): Promise<void> => {
  if (sqlite3) return;
  initPromise ??= performInit().catch((error) => {
    initPromise = null;
    throw error;
  });
  await initPromise;
};

const openDb = async () => {
  if (!sqlite3) {
    throw new Error("sqlite3 não foi inicializado.");
  }

  return sqlite3.open_v2(DB_NAME, OPEN_FLAGS, VFS_NAME);
};

export const initOPFS = async (): Promise<void> => {
  await ensureInit();
};

export const readNotes = async (): Promise<INote[]> => {
  await ensureInit();

  const db = await openDb();
  const rows: INote[] = [];

  await sqlite3!.exec(
    db,
    "SELECT * FROM notes ORDER BY id;",
    (row: unknown[], columns: string[]) => {
      const obj = Object.fromEntries(
        columns.map((col, i) => [col, row[i]]),
      ) as unknown as INote;

      rows.push(obj);
    },
  );

  await sqlite3!.close(db);
  return rows;
};

export const saveNote = async (
  text: string,
  status: keyof typeof NOTE_STATUS,
): Promise<void> => {
  await ensureInit();

  const db = await openDb();
  await sqlite3!.run(
    db,
    "INSERT INTO notes (text, timestamp, status) VALUES (?, ?, ?);",
    [text, Date.now(), status],
  );
  await sqlite3!.close(db);
};

export const deleteNote = async (id: number): Promise<void> => {
  await ensureInit();

  const db = await openDb();
  await sqlite3!.run(db, "DELETE FROM notes WHERE id = ?;", [id]);
  await sqlite3!.close(db);
};

export const updateNote = async (
  noteId: number,
  status: string,
): Promise<void> => {
  await ensureInit();

  const db = await openDb();

  await sqlite3!.run(db, "UPDATE notes SET status = ? WHERE id = ?;", [
    status,
    noteId,
  ]);
  await sqlite3!.close(db);
};
