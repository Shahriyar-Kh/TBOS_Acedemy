import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient, isBrowserSupabaseConfigured } from "./supabaseClient";

export interface AdminUser {
  id: string;
  email: string;
  role: "owner" | "admin" | "admissions";
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  getAuthHeader: () => Record<string, string>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isBrowserSupabaseConfigured();

  const verifyTokenWithServer = useCallback(async (jwt: string): Promise<AdminUser | null> => {
    try {
      const res = await fetch("/api/admin/me", {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.admin) {
          return data.admin as AdminUser;
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Phase 10 optimization: Only run admin auth session logic on admin routes
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
      setIsLoading(false);
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function initSession(activeClient: NonNullable<typeof client>) {
      try {
        const { data: { session } } = await activeClient.auth.getSession();
        if (session?.access_token) {
          const verifiedAdmin = await verifyTokenWithServer(session.access_token);
          if (isMounted) {
            if (verifiedAdmin) {
              setAdmin(verifiedAdmin);
              setToken(session.access_token);
            } else {
              // Authenticated in Supabase but not an admin -> sign out
              await activeClient.auth.signOut();
              setAdmin(null);
              setToken(null);
            }
          }
        }
      } catch (err) {
        console.error("Admin auth initialization error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession(client);

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAdmin(null);
        setToken(null);
        setIsLoading(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session.access_token) {
          const verified = await verifyTokenWithServer(session.access_token);
          if (verified) {
            setAdmin(verified);
            setToken(session.access_token);
          } else {
            await client.auth.signOut();
            setAdmin(null);
            setToken(null);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [verifyTokenWithServer]);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        ok: false,
        error: "Supabase client is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local",
      };
    }

    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !data.session) {
        const msg = authError?.message || "Invalid email or password.";
        setError(msg);
        return { ok: false, error: msg };
      }

      // Check server admin authorization
      const verified = await verifyTokenWithServer(data.session.access_token);
      if (!verified) {
        await supabase.auth.signOut();
        const msg = "Access denied. Your email is not authorized as a TBOS administrator.";
        setError(msg);
        return { ok: false, error: msg };
      }

      setAdmin(verified);
      setToken(data.session.access_token);
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected login error occurred.";
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAdmin(null);
    setToken(null);
  };

  const getAuthHeader = (): Record<string, string> => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        isConfigured,
        error,
        login,
        logout,
        getAuthHeader,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
