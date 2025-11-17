import { create } from "zustand";

import type { RoleName, User } from "../types/user";

interface AuthState {
  token: string | null;
  user: User | null;
  isInitializing: boolean;
  setAuth: (payload: { token: string; user: User }) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  hasRole: (role: RoleName | RoleName[]) => boolean;
}

const tokenFromStorage =
  typeof window !== "undefined" ? localStorage.getItem("safe_city_token") : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  token: tokenFromStorage,
  user: null,
  isInitializing: true,
  setAuth: ({ token, user }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("safe_city_token", token);
    }
    set({ token, user, isInitializing: false });
  },
  setUser: (user) => set({ user, isInitializing: false }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("safe_city_token");
    }
    set({ token: null, user: null, isInitializing: false });
  },
  hasRole: (roleOrRoles) => {
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    const userRoles = get().user?.roles.map((r) => r.name) ?? [];
    return roles.some((role) => userRoles.includes(role));
  },
}));
