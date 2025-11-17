import { Box, Typography } from "@mui/material";

import CommandCenterMap from "../../components/CommandCenterMap";
import FireResourcePanel from "../../components/FireResourcePanel";
import IncidentTable from "../../components/IncidentTable";
import StatCard from "../../components/StatCard";
import useIncidents from "../../features/incidents/useIncidents";
import useFireResources from "../../features/incidents/useFireResources";

const FirePortal = () => {
  const { incidents } = useIncidents();
  const fireIncidents = incidents.filter(
    (incident) => incident.incident_type === "fire"
  );
  const { resources } = useFireResources();

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Fire Brigade Portal
      </Typography>
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
      >
        <StatCard label="Hazard Alerts" value="8" />
        <StatCard label="Water Assets" value="23" />
        <StatCard label="Crews Ready" value="14" />
      </Box>
      <Box mt={3}>
        <CommandCenterMap incidents={fireIncidents} />
      </Box>
      <Box mt={3} display="grid" gap={3} gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}>
        <IncidentTable incidents={fireIncidents} />
        <FireResourcePanel resources={resources} />
      </Box>
    </Box>
  );
};

export default FirePortal;
