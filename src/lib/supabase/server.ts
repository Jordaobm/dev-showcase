import { createClient } from "@supabase/supabase-js";

const TABLE_AUTH_JWT_USERS = "auth-jwt-users";
const TABLE_AUTH_JWT_REFRESH_TOKEN = "auth-jwt-refresh-token";
const TABLE_AUTH_TOTP = "auth-totp";
const TABLE_AUTH_MAGIC_LINK = "auth-magiclink";

export const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
};

export const createUser = async (data: {
  name: string;
  email?: string;
  password?: string;
}) => {
  const { data: row, error } = await getSupabase()
    .from(TABLE_AUTH_JWT_USERS)
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return row;
};

export const getUser = async (email: string) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_JWT_USERS)
    .select("*")
    .eq("email", email);
  if (error) throw new Error(error.message);
  return data;
};

export const getUserById = async (id: number) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_JWT_USERS)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const saveRefreshToken = async (data: {
  token: string;
  user_id?: number;
  expires_at?: Date;
}) => {
  const { data: row, error } = await getSupabase()
    .from(TABLE_AUTH_JWT_REFRESH_TOKEN)
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return row;
};

export const findAndDeleteRefreshToken = async (refreshToken: string) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_JWT_REFRESH_TOKEN)
    .delete()
    .eq("token", refreshToken)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0)
    throw new Error("Refresh token inválido ou expirado");

  return data[0];
};

export const deleteRefreshToken = async (refreshToken: string) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_JWT_REFRESH_TOKEN)
    .delete()
    .eq("token", refreshToken);
  if (error) throw new Error(error.message);

  return data;
};

export const createSecret = async (data: {
  secret: string;
  backup_codes?: string[];
  last_used_token?: string;
  user_id?: number;
}) => {
  const { data: row, error } = await getSupabase()
    .from(TABLE_AUTH_TOTP)
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return row;
};

export const getSecretByUserId = async (id: number) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_TOTP)
    .select("*")
    .eq("user_id", id);
  if (error) throw new Error(error.message);
  return data;
};

export const deleteSecretByUserId = async (userId: number) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_TOTP)
    .delete()
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateLastUsedToken = async (userId: number, token: string) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_TOTP)
    .update({ last_used_token: token })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateBackupCodes = async (
  userId: number,
  backupCodes: string[],
) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_TOTP)
    .update({ backup_codes: backupCodes })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByEmail = async (email: string) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_JWT_USERS)
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};

export const createMagicLink = async (data: {
  user_id?: number;
  token_hash: string;
  expires_at: Date;
}) => {
  const { data: row, error } = await getSupabase()
    .from(TABLE_AUTH_MAGIC_LINK)
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return row;
};

export const getUserByToken = async (token: string) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_MAGIC_LINK)
    .select(
      `
    *,
    user:"${TABLE_AUTH_JWT_USERS}"(*)
  `,
    )
    .eq("token_hash", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};

export const updateToken = async (token: string) => {
  const { data, error } = await getSupabase()
    .from(TABLE_AUTH_MAGIC_LINK)
    .update({ used_at: new Date(Date.now()) })
    .eq("token_hash", token)
    .select(
      `
    *,
    user:"${TABLE_AUTH_JWT_USERS}"(*)
  `,
    )
    .single();
  if (error) throw new Error(error.message);
  return data;
};
