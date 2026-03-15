"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import type { UserProfile } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  const fetchProfile = useCallback(async (userId: string) => {
    // Deduplicate: skip if already fetching or fetched within last 5 seconds
    const now = Date.now();
    if (fetchingRef.current || now - lastFetchRef.current < 5000) return;
    fetchingRef.current = true;
    lastFetchRef.current = now;
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) {
        setProfile(null);
        return;
      }
      const json = await res.json();
      if (json.profile && json.profile.id === userId) {
        setProfile(json.profile);
      } else {
        setProfile(null);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    // Force refresh: reset the timestamp guard
    lastFetchRef.current = 0;
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await fetchProfile(sessionUser.id);
      }

      setIsLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        if (event === "SIGNED_IN") {
          if (sessionUser) await fetchProfile(sessionUser.id);
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === "admin",
      isLoading,
      refreshProfile,
    }),
    [user, profile, isLoading, refreshProfile],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
