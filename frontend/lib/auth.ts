// frontend/lib/auth.ts
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

function safeLocalStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Lê o token somente quando houver window/localStorage */
export function getToken(): string | null {
  const ls = safeLocalStorage();
  return ls ? ls.getItem(TOKEN_KEY) : null;
}

export function setToken(token: string) {
  const ls = safeLocalStorage();
  if (ls) ls.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  const ls = safeLocalStorage();
  if (ls) ls.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

type JwtPayload = {
  id: string;
  email: string;
  role?: "USER" | "ADMIN";
  exp?: number; // epoch (segundos)
};

export function getUserFromToken(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = jwtDecode<JwtPayload>(token);
    // exp existe e já expirou?
    if (payload?.exp && Date.now() >= payload.exp * 1000) {
      clearToken();
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const payload = getUserFromToken();
  return payload?.role === "ADMIN";
}
