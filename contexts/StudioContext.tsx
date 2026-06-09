"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/lib/types";

interface StudioContextValue {
  user:           User | null;
  plan:           Plan;
  authLoading:    boolean;
  showModal:      boolean;
  handleUpgrade:  () => void;
  confirmUpgrade: () => void;
  closeModal:     () => void;
  refreshPlan:    () => Promise<void>;
  signIn:         (email: string) => Promise<{ error: string | null }>;
  signOut:        () => Promise<void>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const [user, setUser]           = useState<User | null>(null);
  const [plan, setPlan]           = useState<Plan>("free");
  const [authLoading, setLoading] = useState(true);
  const [showModal, setModal]     = useState(false);

  // ── Fetch plan once ──────────────────────────────────────────────────────────
  const fetchPlan = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();
    if (data?.plan) setPlan(data.plan as Plan);
  };

  const refreshPlan = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) await fetchPlan(u.id);
  };

  // ── Auth + Realtime ──────────────────────────────────────────────────────────
  useEffect(() => {
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = (userId: string) => {
      // Remove previous channel if exists
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);

      // Subscribe to changes on this user's profile row
      realtimeChannel = supabase
        .channel(`profile-${userId}`)
        .on(
          "postgres_changes",
          {
            event:  "UPDATE",
            schema: "public",
            table:  "profiles",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            // Plan changed in Supabase (e.g. webhook fired) → update context instantly
            const newPlan = payload.new?.plan as Plan | undefined;
            if (newPlan) setPlan(newPlan);
          }
        )
        .subscribe();
    };

    // Initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchPlan(user.id);
        setupRealtime(user.id);
      }
      setLoading(false);
    });

    // Auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchPlan(u.id);
          setupRealtime(u.id);
        } else {
          setPlan("free");
          if (realtimeChannel) supabase.removeChannel(realtimeChannel);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ─────────────────────────────────────────────────────────────
  const signIn = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ── Upgrade ───────────────────────────────────────────────────────────────────
  const handleUpgrade  = () => setModal(true);
  const closeModal     = () => setModal(false);

  const confirmUpgrade = async () => {
    setPlan("pro");
    setModal(false);
    if (user) {
      await supabase.from("profiles").update({ plan: "pro" }).eq("id", user.id);
    }
  };

  return (
    <StudioContext.Provider value={{
      user, plan, authLoading, showModal,
      handleUpgrade, confirmUpgrade, closeModal,
      refreshPlan, signIn, signOut,
    }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be inside <StudioProvider>");
  return ctx;
}
