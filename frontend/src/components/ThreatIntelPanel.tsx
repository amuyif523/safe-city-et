import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Paper, Typography } from "@mui/material";

import type { Incident } from "../types/user";

interface Props {
  incidents: Incident[];
}

const ThreatIntelPanel = ({ incidents }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Threat Intel Feed
    </Typography>
    {incidents.length === 0 ? (
      <Typography variant="body2" color="#8ba3c7">
        No high-severity alerts.
      </Typography>
    ) : (
      incidents.map((incident) => (
        <Box key={incident.id} display="flex" alignItems="center" mb={2}>
          <WarningAmberIcon sx={{ color: "#facc15", mr: 1 }} />
          <Box>
            <Typography fontWeight={600}>{incident.title}</Typography>
            <Typography variant="caption" color="#8ba3c7">
              Severity {incident.severity_score ?? "?"} • {incident.incident_type}
            </Typography>
          </Box>
        </Box>
      ))
    )}
  </Paper>
);

export default ThreatIntelPanel;
