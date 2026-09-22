/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  ReactNode,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LS_ACCESS } from "@/features/auth/hooks/useSession";
import { decodeJWT } from "@/features/shared/utils/decodeJWT";
import { ChatUser, refreshAccessToken } from "../services/api";

const LS_USER = "realtime_demo_user";
const EXPIRY_WARNING_SECONDS = 15;

type SessionState = "idle" | "active" | "expired" | "refreshing";

interface SessionContextProps {
  user: ChatUser | null;
  sessionState: SessionState;
  timeLeft: number;
  isLoggedIn: boolean;
  isExpiring: boolean;
  isRefreshing: boolean;
  initialized: boolean;
  applySession: (user: ChatUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const noop = async () => {};

const SessionContext = createContext<SessionContextProps>({
  user: null,
  sessionState: "idle",
  timeLeft: 0,
  isLoggedIn: false,
  isExpiring: false,
  isRefreshing: false,
  initialized: false,
  applySession: () => {},
  logout: () => {},
  refresh: noop,
});

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [user, setUser] = useState<ChatUser | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expiry, setExpiry] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  const sessionStateRef = useRef<SessionState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didInitRef = useRef(false);

  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  console.log({ sessionState, user });

  const applySession = useCallback((newUser: ChatUser) => {
    localStorage.setItem(LS_USER, JSON.stringify(newUser));

    const token = localStorage.getItem(LS_ACCESS);
    const dec = token ? decodeJWT(token) : null;
    setUser({ ...newUser, token });

    if (dec) {
      const expMs = (dec.payload.exp as number) * 1000;
      setExpiry(expMs);
      setTimeLeft(Math.max(0, Math.floor((expMs - Date.now()) / 1000)));
    }

    setSessionState("active");
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_ACCESS);
    setSessionState("idle");
    setUser(null);
    setExpiry(null);
  }, []);

  const doRefresh = useCallback(async () => {
    try {
      setSessionState("refreshing");
      const refreshedUser = await refreshAccessToken();
      applySession(refreshedUser);
    } catch {
      clearSession();
    }
  }, [applySession, clearSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const refresh = useCallback(async () => {
    await doRefresh();
  }, [doRefresh]);

  useEffect(() => {
    if (!expiry) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const remaining = Math.floor((expiry - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimeLeft(0);
        if (
          sessionStateRef.current !== "expired" &&
          sessionStateRef.current !== "refreshing"
        ) {
          setSessionState("expired");
        }
        return;
      }
      setTimeLeft(remaining);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [expiry]);

  useEffect(() => {
    if (sessionState !== "expired") return;
    const timer = setTimeout(() => doRefresh(), 1500);
    return () => clearTimeout(timer);
  }, [sessionState, doRefresh]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const attemptRefresh = () => {
      setSessionState("refreshing");
      refreshAccessToken()
        .then((refreshedUser) => applySession(refreshedUser))
        .catch(() => clearSession())
        .finally(() => setInitialized(true));
    };

    const token = localStorage.getItem(LS_ACCESS);
    const dec = token ? decodeJWT(token) : null;

    if (!dec) {
      attemptRefresh();
      return;
    }

    const storedUser = localStorage.getItem(LS_USER);
    let parsedUser: ChatUser | null = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser) as ChatUser;
      } catch {
        localStorage.removeItem(LS_USER);
      }
    }

    if (!parsedUser) {
      attemptRefresh();
      return;
    }

    const expMs = (dec.payload.exp as number) * 1000;

    startTransition(() => {
      setUser({ ...parsedUser, token });
      if (expMs > Date.now()) {
        setExpiry(expMs);
        setTimeLeft(Math.max(0, Math.floor((expMs - Date.now()) / 1000)));
        setSessionState("active");
      } else {
        setSessionState("expired");
      }
      setInitialized(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => {
    const isActive = sessionState === "active";
    const isRefreshing = sessionState === "refreshing";
    const isExpiring = isActive && timeLeft <= EXPIRY_WARNING_SECONDS;
    const isLoggedIn = isActive || isRefreshing;

    return {
      user,
      sessionState,
      timeLeft,
      isLoggedIn,
      isExpiring,
      isRefreshing,
      initialized,
      applySession,
      logout,
      refresh,
    };
  }, [
    user,
    sessionState,
    timeLeft,
    initialized,
    applySession,
    logout,
    refresh,
  ]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
