"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JAVA_API_URL } from "@/features/shared/services/api";

export interface NewMessageNotification {
  type: "new_message";
  roomId: number;
  roomName: string;
  senderId: number;
  senderName: string;
  preview: string;
}

interface UseMessageNotificationsOptions {
  selectedRoomId: string | null;
  onOpenRoom: (roomId: string) => void;
  onNewMessage?: (event: NewMessageNotification) => void;
}

const LS_NOTIFY = "realtime_notifications_enabled";
const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 15_000;

const readEnabled = () => {
  try {
    return localStorage.getItem(LS_NOTIFY) === "1";
  } catch {
    return false;
  }
};

const readInitialEnabled = () =>
  typeof window !== "undefined" &&
  readEnabled() &&
  (typeof Notification === "undefined" || Notification.permission !== "denied");

const playBeep = (audioContext: AudioContext) => {
  const now = audioContext.currentTime;
  [660, 880].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.12;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.22);
  });
};

export const useMessageNotifications = (
  token: string | null | undefined,
  { selectedRoomId, onOpenRoom, onNewMessage }: UseMessageNotificationsOptions,
) => {
  const [enabled, setEnabled] = useState(readInitialEnabled);
  const enabledRef = useRef(enabled);
  const selectedRoomIdRef = useRef(selectedRoomId);
  const onOpenRoomRef = useRef(onOpenRoom);
  const onNewMessageRef = useRef(onNewMessage);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    onOpenRoomRef.current = onOpenRoom;
  }, [onOpenRoom]);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabledRef.current;
    if (next) {
      const audioContext = getAudioContext();
      if (audioContext?.state === "suspended") await audioContext.resume();
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (audioContext) playBeep(audioContext);
    }
    enabledRef.current = next;
    setEnabled(next);
    try {
      localStorage.setItem(LS_NOTIFY, next ? "1" : "0");
    } catch {
    }
  }, [getAudioContext]);

  useEffect(() => {
    if (!token) return;

    let disposed = false;
    let attempts = 0;
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const handleNotification = (event: MessageEvent<string>) => {
      let parsed: NewMessageNotification;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      if (parsed.type !== "new_message") return;

      onNewMessageRef.current?.(parsed);

      if (!enabledRef.current) return;
      const viewingRoom =
        String(parsed.roomId) === selectedRoomIdRef.current &&
        document.visibilityState === "visible" &&
        document.hasFocus();
      if (viewingRoom) return;

      const audioContext = audioContextRef.current;
      if (audioContext && audioContext.state === "running") playBeep(audioContext);

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const notification = new Notification(
          `${parsed.senderName} · ${parsed.roomName}`,
          { body: parsed.preview, tag: `room-${parsed.roomId}` },
        );
        notification.onclick = () => {
          window.focus();
          onOpenRoomRef.current(String(parsed.roomId));
          notification.close();
        };
      }
    };

    const connect = () => {
      source = new EventSource(
        `${JAVA_API_URL}/events?token=${encodeURIComponent(token)}`,
      );
      source.addEventListener("ready", () => {
        attempts = 0;
      });
      source.addEventListener("notification", handleNotification as EventListener);
      source.onerror = () => {
        source?.close();
        source = null;
        if (disposed) return;
        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * 2 ** attempts,
          RECONNECT_MAX_DELAY_MS,
        );
        attempts += 1;
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      source?.close();
    };
  }, [token]);

  return { enabled, toggle };
};
