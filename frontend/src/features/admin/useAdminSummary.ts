import { useCallback, useEffect, useState } from "react";

import apiClient from "../../lib/api-client";

export interface AdminSummary {
  users: number;
  incidents: number;
  active_incidents: number;
}

const useAdminSummary = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<AdminSummary>("/admin/summary");
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, refetch: fetchSummary };
};

export default useAdminSummary;
