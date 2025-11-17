import { Box, Typography } from "@mui/material";

import StatCard from "../../components/StatCard";
import IncidentTable from "../../components/IncidentTable";
import CommandCenterMap from "../../components/CommandCenterMap";
import NotificationsPanel from "../../components/NotificationsPanel";
import useIncidents from "../../features/incidents/useIncidents";

const PublicPortal = () => {
  const { incidents } = useIncidents();
  const notifications = [
    {
      id: 1,
      message: "Community alert: Road closure due to flooding.",
      event_type: "alert",
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Citizen Command Center
      </Typography>
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
      >
        <StatCard label="My Reports" value="3" trend="+1 today" />
        <StatCard label="Open Incidents Nearby" value={incidents.length} />
        <StatCard label="Average Response" value="8 mins" />
      </Box>
      <Box
        mt={3}
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", lg: "2fr 1fr" }}
      >
        <CommandCenterMap incidents={incidents} />
        <NotificationsPanel notifications={notifications} />
      </Box>
      <Box mt={3}>
        <IncidentTable incidents={incidents} />
      </Box>
    </Box>
  );
};

export default PublicPortal;
