"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JAVA_API_WSS } from "@/features/shared/services/api";
import type { MessageEntry } from "../services/api";

export interface RoomMemberJoinedEvent {
  type: "room_member_joined";
  roomId: number;
  participantCount: number;
}

export interface RoomDeletedEvent {
  type: "room_deleted";
  roomId: number;
  reason?: "owner" | "expired";
}

interface UseRoomSocketOptions {
  onMessage: (message: MessageEntry) => void;
  onRoomUpdate?: (event: RoomMemberJoinedEvent) => void;
  onRoomDeleted?: (event: RoomDeletedEvent) => void;
  onReconnect?: () => void;
}

const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 15_000;

export const useRoomSocket = (
  roomId: string | null,
  token: string | null | undefined,
  { onMessage, onRoomUpdate, onRoomDeleted, onReconnect }: UseRoomSocketOptions,
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onRoomUpdateRef = useRef(onRoomUpdate);
  const onRoomDeletedRef = useRef(onRoomDeleted);
  const onReconnectRef = useRef(onReconnect);
  const pendingRef = useRef<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onRoomUpdateRef.current = onRoomUpdate;
  }, [onRoomUpdate]);

  useEffect(() => {
    onRoomDeletedRef.current = onRoomDeleted;
  }, [onRoomDeleted]);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!roomId || !token) {
      return;
    }

    pendingRef.current = [];
    let disposed = false;
    let attempts = 0;
    let hadConnection = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const socket = new WebSocket(
        `${JAVA_API_WSS}/realtime/rooms/${roomId}?token=${token}`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        attempts = 0;
        setConnected(true);
        pendingRef.current.splice(0).forEach((content) =>
          socket.send(JSON.stringify({ message: content })),
        );
        if (hadConnection) onReconnectRef.current?.();
        hadConnection = true;
      };
      socket.onclose = () => {
        setConnected(false);
        if (disposed) return;
        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * 2 ** attempts,
          RECONNECT_MAX_DELAY_MS,
        );
        attempts += 1;
        retryTimer = setTimeout(connect, delay);
      };
      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed?.type === "message_error") {
            return;
          }
          if (parsed?.type === "room_deleted") {
            disposed = true;
            onRoomDeletedRef.current?.(parsed as RoomDeletedEvent);
            return;
          }
          if (parsed?.type === "room_member_joined") {
            onRoomUpdateRef.current?.(parsed as RoomMemberJoinedEvent);
            return;
          }
          onMessageRef.current(parsed as MessageEntry);
        } catch {
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      socketRef.current?.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [roomId, token]);

  const sendMessage = useCallback((content: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    if (socket.readyState !== WebSocket.OPEN) {
      pendingRef.current.push(content);
      return;
    }
    socket.send(JSON.stringify({ message: content }));
  }, []);

  return { sendMessage, connected };
};
