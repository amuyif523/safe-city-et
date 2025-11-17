import { useCallback, useEffect, useState } from "react";

import apiClient from "../../lib/api-client";
import type { Notification } from "../../types/user";

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<Notification[]>("/notifications");
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, isLoading, refetch: fetchNotifications };
};

export default useNotifications;
