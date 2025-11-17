import { useEffect, useState } from "react";

import apiClient from "../../lib/api-client";

export interface FireResource {
  name: string;
  latitude: number;
  longitude: number;
  capacity_liters: number;
}

const useFireResources = () => {
  const [resources, setResources] = useState<FireResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<FireResource[]>(
          "/incidents/analytics/fire-water-sources"
        );
        setResources(data);
      } catch {
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchResources();
  }, []);

  return { resources, isLoading };
};

export default useFireResources;
