import { useEffect } from "react";

import { useAuthStore } from "../stores/useAuthStore";
import apiClient from "../lib/api-client";
import type { User } from "../types/user";

const useAuth = () => {
  const { user, token, setUser, logout } = useAuthStore();

  useEffect(() => {
    const loadProfile = async () => {
      if (!token || user) return;
      try {
        const { data } = await apiClient.get<User>("/auth/me");
        setUser(data);
      } catch {
        logout();
      }
    };
    void loadProfile();
  }, [token, user, setUser, logout]);

  return useAuthStore();
};

export default useAuth;
