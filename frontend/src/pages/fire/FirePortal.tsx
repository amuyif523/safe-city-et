import { Box, Typography } from "@mui/material";

import CommandCenterMap from "../../components/CommandCenterMap";
import IncidentTable from "../../components/IncidentTable";
import StatCard from "../../components/StatCard";
import useIncidents from "../../features/incidents/useIncidents";

const FirePortal = () => {
  const { incidents } = useIncidents();
  const fireIncidents = incidents.filter(
    (incident) => incident.incident_type === "fire"
  );

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
      <Box mt={3}>
        <IncidentTable incidents={fireIncidents} />
      </Box>
    </Box>
  );
};

export default FirePortal;
