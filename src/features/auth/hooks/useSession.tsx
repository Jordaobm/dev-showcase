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
import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import {
  AuthResponse,
  RefreshResponse,
  logout as logoutApi,
  refreshAccessToken,
} from "../services/api";
import { DecodedJWT, decodeJWT } from "@/features/shared/utils/decodeJWT";

export const LS_ACCESS = "jwt_demo_access_token";
const EXPIRY_WARNING_SECONDS = 15;

type SessionState = "idle" | "active" | "expired" | "refreshing";

interface SessionContextProps {
  user: AuthResponse["user"] | null;
  decoded: DecodedJWT | null;
  sessionState: SessionState;
  timeLeft: number;
  isLoggedIn: boolean;
  isActive: boolean;
  isExpiring: boolean;
  isExpired: boolean;
  isRefreshing: boolean;
  hasSession: boolean;
  initialized: boolean;
  applyNewSession: (token: string, user: AuthResponse["user"]) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const noop = async () => {};

export const SessionContext = createContext<SessionContextProps>({
  user: null,
  decoded: null,
  sessionState: "idle",
  timeLeft: 0,
  isLoggedIn: false,
  isActive: false,
  isExpiring: false,
  isExpired: false,
  isRefreshing: false,
  hasSession: false,
  initialized: false,
  applyNewSession: () => {},
  logout: noop,
  refresh: noop,
});

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [expiry, setExpiry] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  const sessionStateRef = useRef<SessionState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didInitRef = useRef(false);

  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  const { mutateAsync: mutateRefresh } = useMutation<
    AxiosResponse<RefreshResponse>,
    AxiosError<{ error: string }>,
    void
  >({ mutationFn: refreshAccessToken });

  const { mutateAsync: mutateLogout } = useMutation<
    AxiosResponse,
    AxiosError<{ error: string }>,
    void
  >({ mutationFn: logoutApi });

  const applyNewSession = useCallback(
    (token: string, userData: AuthResponse["user"]) => {
      const dec = decodeJWT(token);
      if (!dec) return;
      const expMs = (dec.payload.exp as number) * 1000;

      localStorage.setItem(LS_ACCESS, token);
      setDecoded(dec);
      setUser(userData);
      setExpiry(expMs);
      setTimeLeft(Math.max(0, Math.floor((expMs - Date.now()) / 1000)));
      setSessionState("active");
    },
    [],
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(LS_ACCESS);
    setSessionState("idle");
    setDecoded(null);
    setUser(null);
    setExpiry(null);
  }, []);

  const doRefresh = useCallback(async () => {
    try {
      setSessionState("refreshing");
      const result = await mutateRefresh();
      applyNewSession(result.data.accessToken, result.data.user);
    } catch {
      clearSession();
    }
  }, [mutateRefresh, applyNewSession, clearSession]);

  const logout = useCallback(async () => {
    clearSession();
    try {
      await mutateLogout();
    } catch {}
  }, [mutateLogout, clearSession]);

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

    const at = localStorage.getItem(LS_ACCESS);

    if (!at) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionState("refreshing");
      refreshAccessToken()
        .then(({ data }) => applyNewSession(data.accessToken, data.user))
        .catch(() => clearSession())
        .finally(() => setInitialized(true));
      return;
    }

    const dec = decodeJWT(at);
    if (!dec) {
      setInitialized(true);
      return;
    }

    const expMs = (dec.payload.exp as number) * 1000;

    startTransition(() => {
      if (expMs > Date.now()) {
        setDecoded(dec);
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
    const isExpiring = isActive && timeLeft <= EXPIRY_WARNING_SECONDS;
    const isExpired = sessionState === "expired";
    const isRefreshing = sessionState === "refreshing";
    const hasSession = sessionState !== "idle";
    const isLoggedIn = isActive || isRefreshing;

    return {
      user,
      decoded,
      sessionState,
      timeLeft,
      isLoggedIn,
      isActive,
      isExpiring,
      isExpired,
      isRefreshing,
      hasSession,
      initialized,
      applyNewSession,
      logout,
      refresh,
    };
  }, [
    user,
    decoded,
    sessionState,
    timeLeft,
    initialized,
    applyNewSession,
    logout,
    refresh,
  ]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
