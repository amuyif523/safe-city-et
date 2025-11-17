import { useCallback, useEffect, useMemo, useState } from "react";

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

  const markAsRead = useCallback(
    async (notificationId: number) => {
      await apiClient.post<Notification>(`/notifications/${notificationId}/read`);
      await fetchNotifications();
    },
    [fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    await Promise.all(
      notifications.filter((notification) => !notification.is_read).map((n) => markAsRead(n.id))
    );
  }, [notifications, markAsRead]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  };
};

export default useNotifications;
