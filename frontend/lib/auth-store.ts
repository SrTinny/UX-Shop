export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive?: boolean;
};

export const AUTH_CHANGED_EVENT = 'auth:changed';

let cachedAuthUser: AuthUser | null | undefined;

export function getCachedAuthUser() {
  return cachedAuthUser;
}

export function setCachedAuthUser(user: AuthUser | null) {
  cachedAuthUser = user;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<AuthUser | null>(AUTH_CHANGED_EVENT, { detail: user }));
  }
}

export function clearCachedAuthUser() {
  setCachedAuthUser(null);
}