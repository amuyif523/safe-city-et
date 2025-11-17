import { useCallback, useEffect, useState } from "react";

import apiClient from "../../lib/api-client";

export interface IncidentAnalytics {
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_type: Record<string, number>;
  average_severity: number;
}

const useIncidentAnalytics = () => {
  const [analytics, setAnalytics] = useState<IncidentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<IncidentAnalytics>("/incidents/analytics/overview");
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, isLoading, refetch: fetchAnalytics };
};

export default useIncidentAnalytics;
