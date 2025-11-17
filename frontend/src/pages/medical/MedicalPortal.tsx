import { Box, Typography } from "@mui/material";

import CommandCenterMap from "../../components/CommandCenterMap";
import IncidentTable from "../../components/IncidentTable";
import StatCard from "../../components/StatCard";
import useIncidents from "../../features/incidents/useIncidents";

const MedicalPortal = () => {
  const { incidents } = useIncidents();
  const medicalIncidents = incidents.filter(
    (incident) => incident.incident_type === "medical"
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        EMS Coordination
      </Typography>
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(4, 1fr)" }}
      >
        <StatCard label="Hospitals Online" value="11" />
        <StatCard label="Ambulances" value="32" />
        <StatCard label="Critical Cases" value="5" />
        <StatCard label="Avg. ER Load" value="68%" />
      </Box>
      <Box mt={3}>
        <CommandCenterMap incidents={medicalIncidents} />
      </Box>
      <Box mt={3}>
        <IncidentTable incidents={medicalIncidents} />
      </Box>
    </Box>
  );
};

export default MedicalPortal;
