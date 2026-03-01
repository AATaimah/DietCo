import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  isSupabaseConfigured,
  signInWithPassword,
  signUpWithEmail,
  upsertProfile,
} from "@/lib/supabase";
import type { AccountType, SupabaseSession, SupabaseUser } from "@/lib/supabase";

interface AuthUser {
  id: string;
  email: string;
  accountType: AccountType;
  fullName: string;
  clinicName: string;
  phone: string;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface RegisterPayload {
  accountType: AccountType;
  fullName: string;
  clinicName?: string;
  phone: string;
  email: string;
  password: string;
  emailRedirectTo?: string;
}

interface RegisterResult {
  requiresEmailVerification: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabaseConfigured: boolean;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const sessionStorageKey = "dietco-auth-session";
const userStorageKey = "dietco-auth-user";

const readStoredJson = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

const mapSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => {
  const metadata = (supabaseUser.user_metadata || {}) as Record<string, string | undefined>;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    accountType: metadata.account_type === "clinic" ? "clinic" : "individual",
    fullName: metadata.full_name || "",
    clinicName: metadata.clinic_name || "",
    phone: metadata.phone || "",
  };
};

const mapSession = (session: SupabaseSession): AuthSession => {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in,
    tokenType: session.token_type,
  };
};

const buildProfilePayload = (supabaseUser: SupabaseUser) => {
  const metadata = (supabaseUser.user_metadata || {}) as Record<string, string | undefined>;
  const email = supabaseUser.email || "";
  const fallbackName = email.includes("@") ? email.split("@")[0] : "User";
  const accountType: AccountType = metadata.account_type === "clinic" ? "clinic" : "individual";

  return {
    userId: supabaseUser.id,
    accountType,
    fullName: metadata.full_name || fallbackName,
    clinicName: accountType === "clinic" ? metadata.clinic_name || null : null,
    phone: metadata.phone || "",
  };
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredJson<AuthUser>(userStorageKey));
  const [session, setSession] = useState<AuthSession | null>(() =>
    readStoredJson<AuthSession>(sessionStorageKey),
  );
  const [isLoading, setIsLoading] = useState(true);

  const syncProfile = async (accessToken: string, supabaseUser: SupabaseUser) => {
    try {
      await upsertProfile(accessToken, buildProfilePayload(supabaseUser));
    } catch (error) {
      console.error("Failed to sync profile to Supabase.", error);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!session?.accessToken || !isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(session.accessToken);
        await syncProfile(session.accessToken, currentUser);
        const mappedUser = mapSupabaseUser(currentUser);
        setUser(mappedUser);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(userStorageKey, JSON.stringify(mappedUser));
        }
      } catch {
        setUser(null);
        setSession(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(userStorageKey);
          window.localStorage.removeItem(sessionStorageKey);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [session?.accessToken]);

  const persistAuthState = (nextUser: AuthUser | null, nextSession: AuthSession | null) => {
    setUser(nextUser);
    setSession(nextSession);

    if (typeof window === "undefined") return;
    if (nextUser) {
      window.localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(userStorageKey);
    }
    if (nextSession) {
      window.localStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(sessionStorageKey);
    }
  };

  const register = async (payload: RegisterPayload): Promise<RegisterResult> => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }

    const response = await signUpWithEmail({
      email: payload.email,
      password: payload.password,
      emailRedirectTo: payload.emailRedirectTo,
      metadata: {
        account_type: payload.accountType,
        full_name: payload.fullName,
        clinic_name: payload.accountType === "clinic" ? payload.clinicName || null : null,
        phone: payload.phone,
      },
    });

    if (!response.session || !response.session.user) {
      return { requiresEmailVerification: true };
    }

    const mappedSession = mapSession(response.session);
    await syncProfile(mappedSession.accessToken, response.session.user);

    return { requiresEmailVerification: false };
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }

    const response = await signInWithPassword(email, password);
    const mappedSession = mapSession(response);
    const mappedUser = mapSupabaseUser(response.user);
    await syncProfile(mappedSession.accessToken, response.user);
    persistAuthState(mappedUser, mappedSession);
  };

  const logout = () => {
    persistAuthState(null, null);
  };

  const value: AuthContextValue = {
    user,
    session,
    isAuthenticated: Boolean(user && session),
    isLoading,
    supabaseConfigured: isSupabaseConfigured,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export type { AuthUser, RegisterPayload, AccountType };
