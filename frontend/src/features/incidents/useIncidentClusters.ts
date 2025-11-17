import { useEffect, useState } from "react";

import apiClient from "../../lib/api-client";

export interface IncidentCluster {
  latitude: number;
  longitude: number;
  count: number;
}

const useIncidentClusters = () => {
  const [clusters, setClusters] = useState<IncidentCluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClusters = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<IncidentCluster[]>("/incidents/analytics/clusters");
        setClusters(data);
      } catch {
        setClusters([]);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchClusters();
  }, []);

  return { clusters, isLoading };
};

export default useIncidentClusters;
