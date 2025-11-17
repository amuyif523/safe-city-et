import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import useAuditLogs from "../features/audit/useAuditLogs";
import apiClient from "../lib/api-client";

const AuditLogPanel = () => {
  const [formFilters, setFormFilters] = useState({
    action: "",
    actorId: "",
    targetType: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<{
    action?: string;
    actor_id?: number;
    target_type?: string;
  }>({});
  const [page, setPage] = useState(1);

  const queryFilters = useMemo(
    () => ({
      ...appliedFilters,
      page,
      size: 20,
    }),
    [appliedFilters, page]
  );

  const { logs, meta, isLoading } = useAuditLogs(queryFilters);

  const handleApply = () => {
    setAppliedFilters({
      action: formFilters.action || undefined,
      actor_id: formFilters.actorId ? Number(formFilters.actorId) : undefined,
      target_type: formFilters.targetType || undefined,
    });
    setPage(1);
  };

  const handleClear = () => {
    setFormFilters({ action: "", actorId: "", targetType: "" });
    setAppliedFilters({});
    setPage(1);
  };

  const handleExport = async () => {
    const { data } = await apiClient.get("/audit/logs", {
      params: { ...appliedFilters, size: 200, page: 1 },
    });
    const blob = new Blob([JSON.stringify(data.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const disableNext =
    !meta || (meta.page ?? 1) * (meta.size ?? 20) >= (meta.total ?? 0);

  return (
    <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Audit Logs</Typography>
        <Button startIcon={<DownloadIcon />} size="small" onClick={handleExport}>
          Export JSON
        </Button>
      </Box>
      <Box
        display="grid"
        gap={2}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
        mb={3}
      >
        <TextField
          label="Action"
          value={formFilters.action}
          onChange={(event) =>
            setFormFilters((prev) => ({ ...prev, action: event.target.value }))
          }
          size="small"
        />
        <TextField
          label="Actor ID"
          value={formFilters.actorId}
          onChange={(event) =>
            setFormFilters((prev) => ({ ...prev, actorId: event.target.value }))
          }
          size="small"
        />
        <TextField
          label="Target Type"
          value={formFilters.targetType}
          onChange={(event) =>
            setFormFilters((prev) => ({ ...prev, targetType: event.target.value }))
          }
          size="small"
        />
        <Button variant="outlined" onClick={handleApply}>
          Apply Filters
        </Button>
        <Button variant="text" onClick={handleClear}>
          Clear
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Actor</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.actor_id ?? "—"}</TableCell>
              <TableCell>
                {log.target_type ?? "—"} {log.target_id ?? ""}
              </TableCell>
              <TableCell>{log.details ?? "—"}</TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography variant="body2" color="#8ba3c7">
                  No audit entries found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="#8ba3c7">
          Page {meta?.page ?? 1}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            disabled={(meta?.page ?? 1) <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={disableNext}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AuditLogPanel;
