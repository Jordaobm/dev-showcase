import { api } from "@/features/shared/services/api";

export interface UserData {
  id?: number;
  name: string;
  email: string;
  password: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt?: string;
    created_at?: string;
  };
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  user: AuthResponse["user"];
}

export const register = async (data: UserData) => {
  const response = await api().post(`/jwt/register`, data);
  return response;
};

export const auth = async (data: UserData) => {
  const response = await api().post<AuthResponse>(`/jwt/auth`, data);
  return response;
};

export const refreshAccessToken = async () => {
  const response = await api().post<RefreshResponse>(`/jwt/refresh`);
  return response;
};

export const logout = async () => {
  const response = await api().post<RefreshResponse>(`/jwt/logout`);
  return response;
};

export const resetTOTP = async () => {
  const response = await api().post(`/totp/reset`);
  return response;
};

export const generateQRCode = async () => {
  const response = await api().post(`/totp/generate`);
  return response;
};

export const validateQRCode = async ({
  token,
  type = "totp",
}: {
  token: string;
  id: number;
  type?: "totp" | "backup";
}) => {
  const response = await api().post(`/totp/validate`, { token, type });
  return response;
};

export const sendMagicLink = async ({ email }: { email: string }) => {
  const response = await api().post(`/magiclink/send`, { email });
  return response;
};

export const login = async ({ token }: { token: string }) => {
  const response = await api().post(`/magiclink/login`, { token });
  return response;
};

export interface IRequestInit {
  username: string;
}

export interface IRequestFinishRegister {
  username: string;
  id: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    publicKey: string;
    publicKeyAlgorithm: number;
    transports: string[];
  };
}

export interface IRequestFinishAuth {
  id: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
  };
}

export interface IResponseFinish {
  verified: boolean;
  credentialId: string;
  username?: string;
  clientData: {
    type: string;
    challenge: string;
    origin: string;
    crossOrigin: boolean;
  };
}

export const initRegister = async (body: IRequestInit) => {
  const response = await api().post(`/credentials/init`, body);
  return response;
};

export const finishRegister = async (body: IRequestFinishRegister) => {
  const response = await api().post(`/credentials/finish`, body);
  return response;
};

export const initAuth = async () => {
  const response = await api().post(`/credentials/auth/init`, {});
  return response;
};

export const finishAuth = async (body: IRequestFinishAuth) => {
  const response = await api().post(`/credentials/auth/finish`, body);
  return response;
};
