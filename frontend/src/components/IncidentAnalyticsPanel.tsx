import { Box, Paper, Typography } from "@mui/material";

import type { IncidentAnalytics } from "../features/incidents/useIncidentAnalytics";

interface Props {
  analytics: IncidentAnalytics | null;
  isLoading?: boolean;
}

const IncidentAnalyticsPanel = ({ analytics, isLoading }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Intelligence Snapshot
    </Typography>
    {isLoading ? (
      <Typography variant="body2">Loading analytics...</Typography>
    ) : !analytics ? (
      <Typography variant="body2" color="#8ba3c7">
        Analytics unavailable.
      </Typography>
    ) : (
      <Box display="grid" gap={2} gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }}>
        <Box>
          <Typography variant="subtitle2">By Status</Typography>
          {Object.entries(analytics.by_status).map(([status, count]) => (
            <Typography key={status} variant="body2" color="#8ba3c7">
              {status}: {count}
            </Typography>
          ))}
        </Box>
        <Box>
          <Typography variant="subtitle2">By Type</Typography>
          {Object.entries(analytics.by_type).map(([incidentType, count]) => (
            <Typography key={incidentType} variant="body2" color="#8ba3c7">
              {incidentType}: {count}
            </Typography>
          ))}
        </Box>
        <Box>
          <Typography variant="subtitle2">By Priority</Typography>
          {Object.entries(analytics.by_priority).map(([priority, count]) => (
            <Typography key={priority} variant="body2" color="#8ba3c7">
              {priority}: {count}
            </Typography>
          ))}
        </Box>
        <Box>
          <Typography variant="subtitle2">Avg. Severity</Typography>
          <Typography variant="h5">{analytics.average_severity.toFixed(1)}</Typography>
        </Box>
      </Box>
    )}
  </Paper>
);

export default IncidentAnalyticsPanel;
