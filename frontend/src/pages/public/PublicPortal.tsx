import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useMemo, useState } from "react";

import CommandCenterMap from "../../components/CommandCenterMap";
import IncidentForm from "../../components/IncidentForm";
import IncidentTable from "../../components/IncidentTable";
import NotificationsPanel from "../../components/NotificationsPanel";
import StatCard from "../../components/StatCard";
import HotspotPanel from "../../components/HotspotPanel";
import useIncidents from "../../features/incidents/useIncidents";
import useNotifications from "../../features/notifications/useNotifications";
import useIncidentClusters from "../../features/incidents/useIncidentClusters";

const PublicPortal = () => {
  const { incidents, isLoading, refetch } = useIncidents();
  const {
    notifications,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
    markAsRead,
  } = useNotifications();
  const { clusters } = useIncidentClusters();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "acknowledged" | "in_progress" | "resolved"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = useMemo(() => {
    const openCount = incidents.filter((incident) => incident.status !== "resolved").length;
    const resolvedCount = incidents.filter((incident) => incident.status === "resolved").length;
    return {
      total: incidents.length,
      open: openCount,
      resolved: resolvedCount,
    };
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [incidents, statusFilter, searchTerm]);

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchNotifications()]);
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Citizen Command Center
      </Typography>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        mb={2}
      >
        <Typography variant="subtitle1" color="#8ba3c7">
          Monitor your submitted reports, track status changes, and stay connected to Safe City
          alerts.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Stack>
      <TextField
        placeholder="Search incidents by keyword..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        fullWidth
        sx={{ mb: 2, maxWidth: 480 }}
      />
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
      >
        <StatCard label="My Reports" value={stats.total} />
        <StatCard label="Open Incidents" value={stats.open} />
        <StatCard label="Resolved" value={stats.resolved} />
      </Box>

      <Box mt={3} display="grid" gap={3} gridTemplateColumns={{ xs: "1fr", lg: "1.4fr 1fr" }}>
        <IncidentForm onSuccess={() => void handleRefresh()} />
        <NotificationsPanel
          notifications={notifications}
          isLoading={notificationsLoading}
          onRefresh={() => void refetchNotifications()}
          onMarkRead={(id) => void markAsRead(id)}
        />
      </Box>

      <Box
        mt={3}
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", lg: "2fr 1fr" }}
      >
        <CommandCenterMap incidents={incidents} />
        <Paper sx={{ p: 3, bgcolor: "#050d16" }}>
          <Typography variant="h6" mb={2}>
            Status Filters
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {[
              { label: "All", value: "all" },
              { label: "Open", value: "open" },
              { label: "Acknowledged", value: "acknowledged" },
              { label: "In Progress", value: "in_progress" },
              { label: "Resolved", value: "resolved" },
            ].map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                color={statusFilter === filter.value ? "primary" : "default"}
                onClick={() => setStatusFilter(filter.value as typeof statusFilter)}
              />
            ))}
          </Stack>
        </Paper>
      </Box>

      <Box mt={3}>
        {isLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : (
          <IncidentTable incidents={filteredIncidents} />
        )}
        {!isLoading && filteredIncidents.length === 0 && (
          <Typography variant="body2" color="#8ba3c7" mt={2}>
            No incidents found for the selected filter.
          </Typography>
        )}
      </Box>
      <Box mt={3}>
        <HotspotPanel clusters={clusters} />
      </Box>
    </Box>
  );
};

export default PublicPortal;
