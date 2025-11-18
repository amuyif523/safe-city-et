import {
  Box,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import CommandCenterMap from "../../components/CommandCenterMap";
import DispatchQueuePanel from "../../components/DispatchQueuePanel";
import HotspotPanel from "../../components/HotspotPanel";
import IncidentTable from "../../components/IncidentTable";
import StatCard from "../../components/StatCard";
import useIncidentClusters from "../../features/incidents/useIncidentClusters";
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
  const { clusters } = useIncidentClusters();

  const [searchTerm, setSearchTerm] = useState("");
  const [minSeverity, setMinSeverity] = useState(0);

  const filteredIncidents = useMemo(() => {
    return policeIncidents.filter((incident) => {
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = (incident.severity_score ?? 0) >= minSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [policeIncidents, searchTerm, minSeverity]);

  const dispatchQueue = filteredIncidents
    .filter((incident) => incident.status !== "resolved")
    .sort((a, b) => (b.severity_score ?? 0) - (a.severity_score ?? 0))
    .slice(0, 5);
  const averageSeverity =
    filteredIncidents.length === 0
      ? 0
      : filteredIncidents.reduce((sum, incident) => sum + (incident.severity_score ?? 0), 0) /
        filteredIncidents.length;

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Police Operations
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
        <TextField
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          fullWidth
        />
        <Box minWidth={200}>
          <Typography variant="caption" color="#8ba3c7">
            Minimum Severity
          </Typography>
          <Slider
            value={minSeverity}
            onChange={(_, value) => setMinSeverity(value as number)}
            min={0}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
      </Stack>
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
      >
        <StatCard label="Active Dispatches" value={dispatchQueue.length} trend="Live" />
        <StatCard label="Open Cases" value={filteredIncidents.length} />
        <StatCard label="Avg. Severity" value={averageSeverity.toFixed(1)} />
      </Box>
      <Box
        mt={3}
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}
      >
        <CommandCenterMap incidents={filteredIncidents} />
        <Box display="grid" gap={2}>
          <IncidentTable incidents={filteredIncidents} />
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

      <Box mt={3} display="grid" gap={3} gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}>
        <DispatchQueuePanel incidents={dispatchQueue} />
        <HotspotPanel clusters={clusters} />
      </Box>
    </Box>
  );
};

export default PolicePortal;
