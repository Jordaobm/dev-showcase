import { LS_ACCESS } from "@/features/auth/hooks/useSession";
import axios from "axios";

export const api = () => {
  const apiClient = axios.create({
    baseURL: `/api`,
    withCredentials: true,
  });

  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(LS_ACCESS);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return apiClient;
};
