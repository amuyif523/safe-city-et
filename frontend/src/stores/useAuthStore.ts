import { create } from "zustand";

import type { RoleName, User } from "../types/user";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isInitializing: boolean;
  setAuth: (payload: { token: string; refreshToken?: string | null; user: User }) => void;
  setTokens: (token: string, refreshToken?: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  hasRole: (role: RoleName | RoleName[]) => boolean;
}

const tokenFromStorage =
  typeof window !== "undefined" ? localStorage.getItem("safe_city_token") : null;
const refreshFromStorage =
  typeof window !== "undefined" ? localStorage.getItem("safe_city_refresh") : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  token: tokenFromStorage,
  refreshToken: refreshFromStorage,
  user: null,
  isInitializing: Boolean(tokenFromStorage),
  setAuth: ({ token, refreshToken, user }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("safe_city_token", token);
      if (refreshToken) {
        localStorage.setItem("safe_city_refresh", refreshToken);
      }
    }
    set({ token, refreshToken: refreshToken ?? null, user, isInitializing: false });
  },
  setTokens: (token, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("safe_city_token", token);
      if (refreshToken) {
        localStorage.setItem("safe_city_refresh", refreshToken);
      }
    }
    set((state) => ({
      token,
      refreshToken: refreshToken ?? state.refreshToken,
    }));
  },
  setUser: (user) => set({ user, isInitializing: false }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("safe_city_token");
      localStorage.removeItem("safe_city_refresh");
    }
    set({ token: null, refreshToken: null, user: null, isInitializing: false });
  },
  hasRole: (roleOrRoles) => {
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    const userRoles = get().user?.roles.map((r) => r.name) ?? [];
    return roles.some((role) => userRoles.includes(role));
  },
}));
