import { useEffect, useState } from "react";

import apiClient from "../../lib/api-client";

export interface HospitalLoad {
  name: string;
  capacity: number;
  occupied: number;
  load_percentage: number;
}

const useHospitalLoad = () => {
  const [data, setData] = useState<HospitalLoad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLoad = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<HospitalLoad[]>("/incidents/analytics/hospital-load");
        setData(data);
      } catch {
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchLoad();
  }, []);

  return { hospitalLoad: data, isLoading };
};

export default useHospitalLoad;
