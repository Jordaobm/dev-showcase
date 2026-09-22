export interface ChatParticipant {
  id: string;
  name: string;
  isOnline: boolean;
}

export const SELF_PARTICIPANT_ID = "self";

interface StoredParticipant {
  id: string;
  name: string;
  isOnline: boolean;
}

interface StoredRoom {
  id: string;
  participants: StoredParticipant[];
}

const STORAGE_KEY = "realtime_demo_rooms";
const LATENCY_MS = 250;

let memoryStore: StoredRoom[] | null = null;

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const loadStore = (): StoredRoom[] => {
  if (memoryStore) return memoryStore;

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        memoryStore = JSON.parse(raw) as StoredRoom[];
        return memoryStore;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  return [];
};

// Participantes ainda não têm endpoint real (só a lista de salas e o histórico de mensagens
// foram integrados até agora), então continuam mockados aqui.
export const fetchParticipants = async (roomId: string): Promise<ChatParticipant[]> => {
  const room = loadStore().find((r) => r.id === roomId);
  if (!room) return delay([]);

  return delay(room.participants.map(({ id, name, isOnline }) => ({ id, name, isOnline })));
};
