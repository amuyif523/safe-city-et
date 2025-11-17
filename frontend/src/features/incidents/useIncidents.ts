import { useCallback, useEffect, useState } from "react";

import apiClient from "../../lib/api-client";
import type { Incident } from "../../types/user";

interface PaginatedIncidents {
  data: Incident[];
}

const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<PaginatedIncidents>("/incidents");
      setIncidents(data.data);
    } catch {
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchIncidents();
  }, [fetchIncidents]);

  return { incidents, isLoading, refetch: fetchIncidents };
};

export default useIncidents;
