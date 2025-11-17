import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard";
import apiClient from "../../lib/api-client";

interface AdminSummary {
  users: number;
  incidents: number;
  active_incidents: number;
}

const AdminPortal = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await apiClient.get<AdminSummary>("/admin/summary");
        setSummary(data);
      } catch {
        setSummary({ users: 0, incidents: 0, active_incidents: 0 });
      }
    };
    void loadSummary();
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Platform Administration
      </Typography>
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
      >
        <StatCard label="Total Users" value={summary?.users ?? 0} />
        <StatCard label="Incidents" value={summary?.incidents ?? 0} />
        <StatCard label="Active Incidents" value={summary?.active_incidents ?? 0} />
      </Box>
      <Paper sx={{ p: 3, bgcolor: "#050d16", mt: 3 }}>
        <Typography variant="h6" mb={2}>
          Agency Performance Overview
        </Typography>
        <Typography variant="body2" color="#8ba3c7">
          Detailed analytics, RBAC controls, and AI audit summaries will live here as
          the project matures. This scaffold keeps design + layout ready for future
          modules.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminPortal;
