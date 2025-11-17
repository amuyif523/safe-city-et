import { Box, Typography } from "@mui/material";

import CommandCenterMap from "../../components/CommandCenterMap";
import IncidentTable from "../../components/IncidentTable";
import StatCard from "../../components/StatCard";
import useIncidents from "../../features/incidents/useIncidents";

const PolicePortal = () => {
  const { incidents } = useIncidents();
  const policeIncidents = incidents.filter((incident) =>
    ["crime", "police"].includes(incident.incident_type)
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Police Operations
      </Typography>
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
      >
        <StatCard label="Active Dispatches" value="12" trend="+3 vs last hour" />
        <StatCard label="Officers On Duty" value="58" />
        <StatCard label="Avg. Response" value="5 mins" />
      </Box>
      <Box
        mt={3}
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}
      >
        <CommandCenterMap incidents={policeIncidents} />
        <IncidentTable incidents={policeIncidents} />
      </Box>
    </Box>
  );
};

export default PolicePortal;
