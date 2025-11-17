import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import AdminIncidentPanel from "../../components/AdminIncidentPanel";
import StatCard from "../../components/StatCard";
import UserManagementTable from "../../components/UserManagementTable";
import apiClient from "../../lib/api-client";
import useAdminSummary from "../../features/admin/useAdminSummary";
import useIncidents from "../../features/incidents/useIncidents";
import useUsers from "../../features/users/useUsers";
import type { Incident } from "../../types/user";

const AdminPortal = () => {
  const {
    summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useAdminSummary();
  const {
    incidents,
    isLoading: incidentsLoading,
    refetch: refetchIncidents,
  } = useIncidents();
  const {
    users,
    isLoading: usersLoading,
    toggleUserActive,
    refetch: refetchUsers,
  } = useUsers();
  const [statusSaving, setStatusSaving] = useState(false);

  const handleStatusChange = async (incidentId: number, status: Incident["status"]) => {
    setStatusSaving(true);
    try {
      await apiClient.patch(`/incidents/${incidentId}`, { status });
      await Promise.all([refetchIncidents(), refetchSummary()]);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([refetchSummary(), refetchIncidents(), refetchUsers()]);
  };

  const criticalIncidents = useMemo(
    () => incidents.filter((incident) => incident.priority === "high").slice(0, 5),
    [incidents]
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4">Platform Administration</Typography>
          <Typography variant="body2" color="#8ba3c7">
            Manage agencies, monitor incidents, and oversee platform-wide metrics.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshAll}
          disabled={summaryLoading || incidentsLoading || usersLoading}
        >
          Refresh
        </Button>
      </Stack>

      <Box display="grid" gap={3} gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}>
        <StatCard label="Total Users" value={summary?.users ?? 0} />
        <StatCard label="Total Incidents" value={summary?.incidents ?? 0} />
        <StatCard label="Active Incidents" value={summary?.active_incidents ?? 0} />
      </Box>

      <Box
        mt={3}
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", lg: "1.5fr 1fr" }}
        alignItems="flex-start"
      >
        <AdminIncidentPanel
          incidents={incidents}
          isLoading={incidentsLoading || statusSaving}
          onStatusChange={handleStatusChange}
        />
        <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
          <Typography variant="h6" mb={2}>
            Critical Watch
          </Typography>
          {criticalIncidents.length === 0 ? (
            <Typography variant="body2" color="#8ba3c7">
              No high-priority incidents at the moment.
            </Typography>
          ) : (
            criticalIncidents.map((incident) => (
              <Box key={incident.id} mb={2}>
                <Typography fontWeight={600}>{incident.title}</Typography>
                <Typography variant="caption" color="#8ba3c7">
                  {incident.status.toUpperCase()} • {incident.incident_type}
                </Typography>
              </Box>
            ))
          )}
        </Paper>
      </Box>

      <Box mt={3}>
        <UserManagementTable
          users={users}
          isLoading={usersLoading}
          onToggleActive={toggleUserActive}
        />
      </Box>
    </Box>
  );
};

export default AdminPortal;
