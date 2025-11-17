import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { Box, Paper, Typography } from "@mui/material";

import type { FireResource } from "../features/incidents/useFireResources";

interface Props {
  resources: FireResource[];
  isLoading?: boolean;
}

const FireResourcePanel = ({ resources, isLoading }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Water Sources
    </Typography>
    {isLoading ? (
      <Typography variant="body2">Loading hydrant data...</Typography>
    ) : resources.length === 0 ? (
      <Typography variant="body2" color="#8ba3c7">
        No water sources registered.
      </Typography>
    ) : (
      resources.map((resource) => (
        <Box key={resource.name} display="flex" alignItems="center" mb={2}>
          <WaterDropIcon sx={{ color: "#38bdf8", mr: 1 }} />
          <Box>
            <Typography fontWeight={600}>{resource.name}</Typography>
            <Typography variant="caption" color="#8ba3c7">
              {resource.capacity_liters.toLocaleString()} L •{" "}
              {resource.latitude.toFixed(3)}, {resource.longitude.toFixed(3)}
            </Typography>
          </Box>
        </Box>
      ))
    )}
  </Paper>
);

export default FireResourcePanel;
