// frontend/lib/auth.ts
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

type JwtPayload = {
  id: string;
  email: string;
  role?: "USER" | "ADMIN";
  exp?: number;
};

export function getUserFromToken(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = jwtDecode<JwtPayload>(token);
    // exp (se existir) e já expirou?
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
