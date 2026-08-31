import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kayan.admin.auth_session";
const AUTH_EVENT = "kayan:admin-auth-event";

// Valid Admin Emails
const VALID_ADMIN_EMAILS = [
  "k&a_adms.d",
  "k&a_adms.d@kayan.cafe",
  "admin@kayan.cafe",
  "admin@kayan.com",
  "admin",
  "kayan@admin.com",
];

// Valid Password SHA-256 Hashes or Direct valid passwords
const VALID_PASSWORDS = new Set([
  "K&A_admS.d",
  "k&a_adms.d",
  "kayan@admin2026",
  "kayan2026",
  "admin2026",
  "admin",
]);

const VALID_PASSWORD_HASHES = new Set([
  "fb5719f5baf02fba933f5ab922c2986e4ec7f9ceb1ff87dfdd8cb84feaef9113", // kayan@admin2026
  "c9346c43d5ea65d103240fe2e63aa5cdd26161d039ebaf1331f59f2f2455256e", // kayan2026
  "6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6", // admin2026
  "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
]);

export const ADMIN_DEFAULT_EMAIL = "admin@kayan.cafe";

// Helper to hash string to SHA-256 hex
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signIn(
  email: string,
  password: string,
  rememberMe: boolean = false,
): Promise<{ success: boolean; error: string | null }> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { success: false, error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." };
  }

  // Check email
  const isEmailValid = VALID_ADMIN_EMAILS.includes(normalizedEmail);
  if (!isEmailValid) {
    return { success: false, error: "البريد الإلكتروني غير مسجل كمسؤول." };
  }

  // Check password
  const isDirectMatch = VALID_PASSWORDS.has(trimmedPassword);
  const inputHash = await sha256(trimmedPassword);
  const isHashMatch = VALID_PASSWORD_HASHES.has(inputHash);

  if (!isDirectMatch && !isHashMatch) {
    return { success: false, error: "كلمة المرور غير صحيحة." };
  }

  // Generate secure session
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const session = {
    email: normalizedEmail.includes("@") ? normalizedEmail : "admin@kayan.cafe",
    token,
    role: "superadmin",
    rememberMe,
    expiresAt: rememberMe
      ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      : Date.now() + 24 * 60 * 60 * 1000, // 1 day
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch (e) {
    console.error("Storage error", e);
  }

  return { success: true, error: null };
}

export function signOut() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch (e) {
    console.error("Logout error", e);
  }
}

export function useAdminSession() {
  const [state, setState] = useState<{ ready: boolean; email: string | null }>({
    ready: false,
    email: null,
  });

  const sync = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setState({ ready: true, email: null });
        return;
      }
      const session = JSON.parse(raw);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        signOut();
        setState({ ready: true, email: null });
      } else {
        setState({ ready: true, email: session.email || null });
      }
    } catch {
      setState({ ready: true, email: null });
    }
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return state;
}
