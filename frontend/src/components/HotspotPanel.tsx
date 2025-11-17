import { Paper, Typography } from "@mui/material";

import type { IncidentCluster } from "../features/incidents/useIncidentClusters";

interface Props {
  clusters: IncidentCluster[];
  isLoading?: boolean;
}

const HotspotPanel = ({ clusters, isLoading }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Incident Hotspots
    </Typography>
    {isLoading ? (
      <Typography variant="body2">Calculating clusters...</Typography>
    ) : clusters.length === 0 ? (
      <Typography variant="body2" color="#8ba3c7">
        No cluster data available.
      </Typography>
    ) : (
      clusters.slice(0, 5).map((cluster, index) => (
        <Typography key={`${cluster.latitude}-${cluster.longitude}`} variant="body2">
          {index + 1}. {cluster.latitude.toFixed(2)}, {cluster.longitude.toFixed(2)} –{" "}
          {cluster.count} incidents
        </Typography>
      ))
    )}
  </Paper>
);

export default HotspotPanel;
