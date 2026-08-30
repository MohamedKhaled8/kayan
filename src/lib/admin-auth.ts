import { useCallback, useEffect, useState } from "react";

/**
 * Placeholder admin session. Replace `signIn`/`signOut`/`useAdminSession`
 * with supabase.auth.signInWithPassword / signOut / onAuthStateChange once
 * you connect your own Supabase project (see supabase/README.md).
 */
const KEY = "maison.admin.session";
const EVENT = "maison:admin-session";

export const DEMO_EMAIL = "owner@maisoncafe.co";
export const DEMO_PASSWORD = "espresso";

export function signIn(email: string, password: string) {
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return { error: "Those credentials don't match an admin account." };
  }
  window.localStorage.setItem(KEY, JSON.stringify({ email: DEMO_EMAIL, at: Date.now() }));
  window.dispatchEvent(new Event(EVENT));
  return { error: null };
}

export function signOut() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useAdminSession() {
  const [state, setState] = useState<{ ready: boolean; email: string | null }>({
    ready: false,
    email: null,
  });

  const sync = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      setState({ ready: true, email: raw ? (JSON.parse(raw).email as string) : null });
    } catch {
      setState({ ready: true, email: null });
    }
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return state;
}
