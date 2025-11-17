import { Box, Paper, Typography } from "@mui/material";

import CommandCenterMap from "../../components/CommandCenterMap";
import IncidentTable from "../../components/IncidentTable";
import StatCard from "../../components/StatCard";
import useIncidents from "../../features/incidents/useIncidents";
import useNearestResponders from "../../features/incidents/useNearestResponders";

const PolicePortal = () => {
  const { incidents } = useIncidents();
  const policeIncidents = incidents.filter((incident) =>
    ["crime", "police"].includes(incident.incident_type)
  );
  const latestLocation = policeIncidents.find(
    (incident) => incident.latitude && incident.longitude
  );
  const { responders } = useNearestResponders(latestLocation?.latitude, latestLocation?.longitude);

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
        <Box display="grid" gap={2}>
          <IncidentTable incidents={policeIncidents} />
          <Paper sx={{ p: 2, bgcolor: "#050d16" }}>
            <Typography variant="h6">Nearest Responders</Typography>
            {responders.length === 0 ? (
              <Typography variant="body2" color="#8ba3c7">
                No geocoded incidents yet.
              </Typography>
            ) : (
              responders.map((responder) => (
                <Box key={responder.id} mt={1}>
                  <Typography fontWeight={600}>{responder.name}</Typography>
                  <Typography variant="caption" color="#8ba3c7">
                    {responder.role} • {(responder.latitude ?? 0).toFixed(3)},{" "}
                    {(responder.longitude ?? 0).toFixed(3)}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default PolicePortal;
