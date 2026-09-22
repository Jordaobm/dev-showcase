import { LS_ACCESS } from "@/features/auth/hooks/useSession";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export const JAVA_API_URL =
  process.env.NEXT_PUBLIC_JAVA_API_URL ?? "https://localhost:8081";

export const JAVA_API_WSS =
  process.env.NEXT_PUBLIC_JAVA_API_WSS ?? "wss://localhost:8081";

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Dedupe concorrente: se varias chamadas 401am ao mesmo tempo, todas aguardam o mesmo refresh
// em vez de disparar N chamadas a /refresh (o backend rotaciona o refresh token a cada uso,
// entao chamadas paralelas se invalidariam umas as outras).
let nextRefreshPromise: Promise<string> | null = null;
let javaRefreshPromise: Promise<string> | null = null;

const refreshNextAccessToken = (): Promise<string> => {
  if (!nextRefreshPromise) {
    nextRefreshPromise = axios
      .post<{ accessToken: string }>("/api/jwt/refresh", null, {
        withCredentials: true,
      })
      .then(({ data }) => {
        localStorage.setItem(LS_ACCESS, data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        nextRefreshPromise = null;
      });
  }
  return nextRefreshPromise;
};

const refreshJavaAccessToken = (): Promise<string> => {
  if (!javaRefreshPromise) {
    javaRefreshPromise = axios
      .post<{ accessToken: string }>(`${JAVA_API_URL}/refresh`, null, {
        withCredentials: true,
      })
      .then(({ data }) => {
        localStorage.setItem(LS_ACCESS, data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        javaRefreshPromise = null;
      });
  }
  return javaRefreshPromise;
};

const withAutoRefresh = (
  apiClient: AxiosInstance,
  refreshFn: () => Promise<string>,
  refreshUrlSuffix: string,
): AxiosInstance => {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(LS_ACCESS);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;

      const isRefreshCall = original?.url?.includes(refreshUrlSuffix);

      if (
        error.response?.status !== 401 ||
        !original ||
        original._retry ||
        isRefreshCall
      ) {
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        const accessToken = await refreshFn();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        localStorage.removeItem(LS_ACCESS);
        return Promise.reject(refreshError);
      }
    },
  );

  return apiClient;
};

export const api = () =>
  withAutoRefresh(
    axios.create({ baseURL: `/api`, withCredentials: true }),
    refreshNextAccessToken,
    "/jwt/refresh",
  );

export const javaApi = () =>
  withAutoRefresh(
    axios.create({ baseURL: JAVA_API_URL, withCredentials: true }),
    refreshJavaAccessToken,
    "/refresh",
  );
