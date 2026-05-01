export interface INote {
  text: string;
  timestamp: number;
  status: string;
  id: number;
}

export const NOTE_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
};
export const SYNC_COMPLETED = "SYNC_COMPLETED";

export const RETRY_REQUESTS = "RETRY_REQUESTS";
