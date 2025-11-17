import { Paper, Typography } from "@mui/material";

import type { Incident } from "../types/user";

interface Props {
  incidents: Incident[];
}

const DispatchQueuePanel = ({ incidents }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Dispatch Queue
    </Typography>
    {incidents.length === 0 ? (
      <Typography variant="body2" color="#8ba3c7">
        No pending assignments.
      </Typography>
    ) : (
      incidents.map((incident) => (
        <div key={incident.id} style={{ marginBottom: "1rem" }}>
          <Typography fontWeight={600}>
            #{incident.id} • {incident.title}
          </Typography>
          <Typography variant="caption" color="#8ba3c7">
            Priority {incident.priority.toUpperCase()} • Severity {incident.severity_score ?? "?"}
          </Typography>
        </div>
      ))
    )}
  </Paper>
);

export default DispatchQueuePanel;
