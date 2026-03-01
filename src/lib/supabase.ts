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
  addressLine1?: string | null;
  addressCity?: string | null;
  addressDistrict?: string | null;
  addressPostalCode?: string | null;
  paymentCardholderName?: string | null;
  paymentBrand?: string | null;
  paymentLast4?: string | null;
  paymentExpMonth?: string | null;
  paymentExpYear?: string | null;
}

export interface ProfileRecord {
  id: string;
  account_type: AccountType;
  full_name: string;
  clinic_name: string | null;
  phone: string;
  address_line1: string | null;
  address_city: string | null;
  address_district: string | null;
  address_postal_code: string | null;
  payment_cardholder_name: string | null;
  payment_brand: string | null;
  payment_last4: string | null;
  payment_exp_month: string | null;
  payment_exp_year: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRecord {
  id: string;
  status: string;
  created_at: string;
  account_type: AccountType;
  buyer_name: string;
  clinic_name: string | null;
  city: string;
  items: unknown;
}

interface CreateOrderPayload {
  userId: string | null;
  accountType: AccountType;
  buyerName: string;
  clinicName: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string | null;
  postalCode: string | null;
  additionalNotes: string | null;
  items: unknown[];
  status?: string;
}

export const upsertProfile = async (accessToken: string, payload: ProfilePayload) => {
  await supabaseRequest(
    "/rest/v1/profiles?on_conflict=id",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify([
        {
          id: payload.userId,
          account_type: payload.accountType,
          full_name: payload.fullName,
          clinic_name: payload.clinicName,
          phone: payload.phone,
          address_line1: payload.addressLine1 ?? null,
          address_city: payload.addressCity ?? null,
          address_district: payload.addressDistrict ?? null,
          address_postal_code: payload.addressPostalCode ?? null,
          payment_cardholder_name: payload.paymentCardholderName ?? null,
          payment_brand: payload.paymentBrand ?? null,
          payment_last4: payload.paymentLast4 ?? null,
          payment_exp_month: payload.paymentExpMonth ?? null,
          payment_exp_year: payload.paymentExpYear ?? null,
        },
      ]),
    },
    accessToken,
  );
};

export const getProfile = async (accessToken: string, userId: string) => {
  const encodedUserId = encodeURIComponent(userId);
  const response = await supabaseRequest(
    `/rest/v1/profiles?id=eq.${encodedUserId}&select=*`,
    { method: "GET" },
    accessToken,
  );
  const rows = Array.isArray(response) ? (response as ProfileRecord[]) : [];
  return rows[0] || null;
};

interface ProfileUpdatePayload {
  fullName: string;
  clinicName: string | null;
  phone: string;
  addressLine1: string | null;
  addressCity: string | null;
  addressDistrict: string | null;
  addressPostalCode: string | null;
  paymentCardholderName: string | null;
  paymentBrand: string | null;
  paymentLast4: string | null;
  paymentExpMonth: string | null;
  paymentExpYear: string | null;
}

export const updateProfile = async (
  accessToken: string,
  userId: string,
  payload: ProfileUpdatePayload,
) => {
  const encodedUserId = encodeURIComponent(userId);
  const response = await supabaseRequest(
    `/rest/v1/profiles?id=eq.${encodedUserId}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        full_name: payload.fullName,
        clinic_name: payload.clinicName,
        phone: payload.phone,
        address_line1: payload.addressLine1,
        address_city: payload.addressCity,
        address_district: payload.addressDistrict,
        address_postal_code: payload.addressPostalCode,
        payment_cardholder_name: payload.paymentCardholderName,
        payment_brand: payload.paymentBrand,
        payment_last4: payload.paymentLast4,
        payment_exp_month: payload.paymentExpMonth,
        payment_exp_year: payload.paymentExpYear,
        updated_at: new Date().toISOString(),
      }),
    },
    accessToken,
  );

  const rows = Array.isArray(response) ? (response as ProfileRecord[]) : [];
  return rows[0] || null;
};

export const getOrders = async (accessToken: string, userId: string) => {
  const encodedUserId = encodeURIComponent(userId);
  const response = await supabaseRequest(
    `/rest/v1/orders?user_id=eq.${encodedUserId}&select=id,status,created_at,account_type,buyer_name,clinic_name,city,items&order=created_at.desc`,
    { method: "GET" },
    accessToken,
  );
  return Array.isArray(response) ? (response as OrderRecord[]) : [];
};

export const createOrder = async (accessToken: string | null | undefined, payload: CreateOrderPayload) => {
  const response = await supabaseRequest(
    "/rest/v1/orders",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify([
        {
          user_id: payload.userId,
          account_type: payload.accountType,
          buyer_name: payload.buyerName,
          clinic_name: payload.clinicName,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          city: payload.city,
          district: payload.district,
          postal_code: payload.postalCode,
          additional_notes: payload.additionalNotes,
          items: payload.items,
          status: payload.status || "pending",
        },
      ]),
    },
    accessToken || undefined,
  );

  const rows = Array.isArray(response) ? (response as OrderRecord[]) : [];
  return rows[0] || null;
};
