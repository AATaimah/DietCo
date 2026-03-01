export type AccountType = "individual" | "clinic";

export interface SupabaseUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: SupabaseUser;
}

interface SupabaseAuthError {
  error_description?: string;
  msg?: string;
  message?: string;
  error?: string;
  error_code?: string;
  code?: string;
}

const runtimeEnv = import.meta.env as Record<string, string | boolean | undefined>;

const readEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = runtimeEnv[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};

const supabaseUrl = readEnv("VITE_SUPABASE_URL");
const supabasePublishableKey = readEnv("VITE_SUPABASE_ANON_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

const getSupabaseConfig = () => {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return { supabaseUrl, supabasePublishableKey };
};

const resolveErrorMessage = (body: unknown, fallback: string) => {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    const authError = body as SupabaseAuthError;
    const message =
      authError.error_description ||
      authError.msg ||
      authError.message ||
      fallback;
    const code = authError.error_code || authError.code || authError.error;
    return code ? `${message} (${code})` : message;
  }
  return fallback;
};

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const supabaseRequest = async (
  path: string,
  init?: RequestInit,
  accessToken?: string,
) => {
  const { supabaseUrl: url, supabasePublishableKey } = getSupabaseConfig();
  const headers = new Headers(init?.headers || {});

  headers.set("apikey", supabasePublishableKey);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${url}${path}`, {
    ...init,
    headers,
  });

  const body = await parseResponse(response);
  if (!response.ok) {
    throw new Error(resolveErrorMessage(body, `Supabase request failed (${response.status})`));
  }
  return body;
};

interface SignUpPayload {
  email: string;
  password: string;
  emailRedirectTo?: string;
  metadata: {
    account_type: AccountType;
    full_name: string;
    clinic_name: string | null;
    phone: string;
  };
}

interface SignUpResponse {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
}

type LoginResponse = SupabaseSession;

export const signUpWithEmail = (payload: SignUpPayload) => {
  return supabaseRequest("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      data: payload.metadata,
      options: payload.emailRedirectTo
        ? {
            emailRedirectTo: payload.emailRedirectTo,
          }
        : undefined,
    }),
  }) as Promise<SignUpResponse>;
};

export const signInWithPassword = (email: string, password: string) => {
  return supabaseRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }) as Promise<LoginResponse>;
};

export const getCurrentUser = (accessToken: string) => {
  return supabaseRequest("/auth/v1/user", { method: "GET" }, accessToken) as Promise<SupabaseUser>;
};

interface ProfilePayload {
  userId: string;
  accountType: AccountType;
  fullName: string;
  clinicName: string | null;
  phone: string;
}

export const upsertProfile = async (accessToken: string, payload: ProfilePayload) => {
  await supabaseRequest(
    "/rest/v1/profiles?on_conflict=id",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        {
          id: payload.userId,
          account_type: payload.accountType,
          full_name: payload.fullName,
          clinic_name: payload.clinicName,
          phone: payload.phone,
        },
      ]),
    },
    accessToken,
  );
};
