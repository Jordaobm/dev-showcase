"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JAVA_API_WSS } from "@/features/shared/services/api";
import type { MessageEntry } from "../services/api";

interface UseRoomSocketOptions {
  onMessage: (message: MessageEntry) => void;
}

export const useRoomSocket = (
  roomId: string | null,
  token: string | null | undefined,
  { onMessage }: UseRoomSocketOptions,
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Reconecta sempre que a sala selecionada (ou o token) mudar — uma conexão por sala,
  // não uma conexão única com roteamento por mensagem. Ver ROADMAP_F11 Passo 4.
  useEffect(() => {
    if (!roomId || !token) {
      return;
    }

    const socket = new WebSocket(
      `${JAVA_API_WSS}/realtime/rooms/${roomId}?token=${token}`,
    );
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as MessageEntry;
        onMessageRef.current(parsed);
      } catch {
        // payload não-JSON (ex.: "Bem vindo ao servidor!" do handshake) — ignora.
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [roomId, token]);

  const sendMessage = useCallback((content: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ message: content }));
  }, []);

  return { sendMessage, connected };
};
