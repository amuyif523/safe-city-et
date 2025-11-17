import { useEffect, useState } from "react";

import apiClient from "../../lib/api-client";

export interface Responder {
  id: number;
  name: string;
  role: string;
  latitude: number;
  longitude: number;
}

const useNearestResponders = (latitude?: number | null, longitude?: number | null) => {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResponders = async () => {
      if (latitude == null || longitude == null) {
        setResponders([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<Responder[]>(
          "/incidents/recommendations/nearest-responders",
          { params: { latitude, longitude } }
        );
        setResponders(data);
      } catch {
        setResponders([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchResponders();
  }, [latitude, longitude]);

  return { responders, isLoading };
};

export default useNearestResponders;
