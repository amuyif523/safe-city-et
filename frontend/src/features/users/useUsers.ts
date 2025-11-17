import { useCallback, useEffect, useState } from "react";

import apiClient from "../../lib/api-client";
import type { User } from "../../types/user";

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<User[]>("/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleUserActive = useCallback(
    async (userId: number, isActive: boolean) => {
      await apiClient.patch(`/users/${userId}`, { is_active: isActive });
      await fetchUsers();
    },
    [fetchUsers]
  );

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    toggleUserActive,
  };
};

export default useUsers;
