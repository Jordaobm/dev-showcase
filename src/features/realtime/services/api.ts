import axios from "axios";
import { LS_ACCESS } from "@/features/auth/hooks/useSession";
import { javaApi } from "@/features/shared/services/api";

export interface IResponseRegister {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt?: string;
  };
  accessToken: string;
}

export interface IResponseCreateRoom {
  id: number;
  link: string;
  name: string;
  ownerId: number;
  createdAt: string;
  expiresAt: string;
}

export interface RoomMemberUser {
  id: number;
  name: string;
  email: string;
}

export interface RoomMemberSummary {
  id: number;
  jwtUser: RoomMemberUser;
}

export interface RoomDetail {
  id: number;
  link: string;
  jwtUser: RoomMemberUser;
  name: string;
  createdAt: string;
  expiresAt: string;
  roomMembers: RoomMemberSummary[];
}

export interface RoomMembership {
  id: number;
  room: RoomDetail;
}

export interface ChatRoom {
  id: string;
  name: string;
  expiresInDays: number;
  participantCount: number;
  maxParticipants: number;
  lastMessage?: string;
}

// Espelha o limite de 10 membros aplicado em RoomService.signinRoom no backend.
const MAX_ROOM_MEMBERS = 10;

const toExpiresInDays = (expiresAt: string): number => {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
};

const toChatRoom = (membership: RoomMembership): ChatRoom => ({
  id: String(membership.room.id),
  name: membership.room.name,
  expiresInDays: toExpiresInDays(membership.room.expiresAt),
  participantCount: membership.room.roomMembers.length,
  maxParticipants: MAX_ROOM_MEMBERS,
});

export interface MessageSender {
  id: number;
  name: string;
}

export interface MessageEntry {
  id: number;
  jwtUser: MessageSender;
  content: string;
  sentAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isMine: boolean;
}

export interface ChatUser {
  id: number;
  username: string;
  email: string;
  token?: string | null;
}

export class ApiError extends Error {
  code?: string;

  constructor(code?: string) {
    super(code ?? "unknown_error");
    this.code = code;
  }
}

const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    return new ApiError(data?.error);
  }
  return new ApiError();
};

const toChatUser = (user: IResponseRegister["user"]): ChatUser => ({
  id: user.id,
  username: user.name,
  email: user.email,
});

const applyAccessToken = (response: IResponseRegister): ChatUser => {
  localStorage.setItem(LS_ACCESS, response.accessToken);
  return toChatUser(response.user);
};

export const register = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<ChatUser> => {
  try {
    await javaApi().post("/register", {
      name: data.username,
      email: data.email,
      password: data.password,
    });
  } catch (error) {
    throw toApiError(error);
  }

  return login({ email: data.email, password: data.password });
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<ChatUser> => {
  try {
    const response = await javaApi().post<IResponseRegister>("/login", data);
    return applyAccessToken(response.data);
  } catch (error) {
    throw toApiError(error);
  }
};

export const refreshAccessToken = async (): Promise<ChatUser> => {
  const response = await javaApi().post<IResponseRegister>("/refresh");
  return applyAccessToken(response.data);
};

export const forgotPassword = async (email: string): Promise<void> => {
  await javaApi().post("/forgot-password", { email });
};

export const resetPassword = async (data: {
  token: string;
  newPassword: string;
}): Promise<void> => {
  try {
    await javaApi().post("/reset-password", data);
  } catch (error) {
    throw toApiError(error);
  }
};

export const createRoom = async (data: {
  roomTitle: string;
}): Promise<IResponseCreateRoom> => {
  const response = await javaApi().post<IResponseCreateRoom>("/room/create", {
    roomTitle: data.roomTitle,
  });
  return response.data;
};

export const listRooms = async (): Promise<ChatRoom[]> => {
  const response = await javaApi().get<RoomMembership[]>("/rooms");
  return response.data.map(toChatRoom);
};

export const listMessages = async (roomId: string): Promise<MessageEntry[]> => {
  const response = await javaApi().get<MessageEntry[]>(
    `/room/${roomId}/messages`,
  );
  return response.data;
};

const extractRoomLink = (rawLink: string): string => {
  const trimmed = rawLink.trim();
  return trimmed.split("/").filter(Boolean).pop() ?? trimmed;
};

export const joinRoomByLink = async (data: {
  link: string;
}): Promise<IResponseCreateRoom> => {
  const response = await javaApi().post<IResponseCreateRoom>("/room/signin", {
    link: extractRoomLink(data.link),
  });
  return response.data;
};
