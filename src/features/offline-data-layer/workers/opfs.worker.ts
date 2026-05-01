import {
  initOPFS,
  readNotes,
  saveNote,
  deleteNote,
  updateNote,
} from "../services/opfs";

const worker = self as unknown as DedicatedWorkerGlobalScope;

worker.addEventListener("message", async (event: MessageEvent) => {
  const { id, type, ...payload } = event.data;

  try {
    switch (type) {
      case "init": {
        await initOPFS();
        worker.postMessage({ id });
        break;
      }

      case "read": {
        const rows = await readNotes();
        worker.postMessage({ id, rows });
        break;
      }

      case "save": {
        await saveNote(payload.text, payload.status);
        worker.postMessage({ id });
        break;
      }

      case "delete": {
        await deleteNote(payload.noteId);
        worker.postMessage({ id });
        break;
      }

      case "update": {
        await updateNote(payload.noteId, payload.status);
        worker.postMessage({ id });
        break;
      }
    }
  } catch (error: unknown) {
    worker.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
