import { useCallback, useEffect, useState } from "react";

import apiClient from "../../lib/api-client";

export interface AuditLog {
  id: number;
  action: string;
  actor_id: number | null;
  target_type: string | null;
  target_id: number | null;
  details?: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  action?: string;
  actor_id?: number;
  target_type?: string;
  page?: number;
  size?: number;
}

interface AuditLogResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    size: number;
  };
}

const useAuditLogs = (filters: AuditLogFilters) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<AuditLogResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<AuditLogResponse>("/audit/logs", {
        params: filters,
      });
      setLogs(data.data);
      setMeta(data.meta);
    } catch {
      setLogs([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return { logs, meta, isLoading, refetch: fetchLogs };
};

export default useAuditLogs;
