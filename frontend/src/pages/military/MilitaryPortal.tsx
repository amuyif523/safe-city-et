import { Box, Typography } from "@mui/material";

import CommandCenterMap from "../../components/CommandCenterMap";
import IncidentTable from "../../components/IncidentTable";
import StatCard from "../../components/StatCard";
import useIncidents from "../../features/incidents/useIncidents";

const MilitaryPortal = () => {
  const { incidents } = useIncidents();
  const militaryIncidents = incidents.filter(
    (incident) => incident.incident_type === "military"
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        National Security Watch
      </Typography>
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(4, 1fr)" }}
      >
        <StatCard label="Threat Alerts" value="2" trend="Stable" />
        <StatCard label="Intel Briefings" value="4" />
        <StatCard label="Deployments" value="6" />
        <StatCard label="Critical Assets" value="18" />
      </Box>
      <Box mt={3}>
        <CommandCenterMap incidents={militaryIncidents} />
      </Box>
      <Box mt={3}>
        <IncidentTable incidents={militaryIncidents} />
      </Box>
    </Box>
  );
};

export default MilitaryPortal;
