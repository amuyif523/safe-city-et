import { useEffect, useState } from "react";

import apiClient from "../../lib/api-client";
import type { Incident } from "../../types/user";

interface PaginatedIncidents {
  data: Incident[];
}

const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<PaginatedIncidents>("/incidents");
        setIncidents(data.data);
      } catch {
        // swallow errors for initial scaffolding
      } finally {
        setIsLoading(false);
      }
    };
    void fetchIncidents();
  }, []);

  return { incidents, isLoading };
};

export default useIncidents;
