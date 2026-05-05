import { api } from "@/features/shared/services/api";

export const isOnline = async () => {
  const response = await api().get(`/health`);
  return response;
};
