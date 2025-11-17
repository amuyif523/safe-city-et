import { LinearProgress, Paper, Typography } from "@mui/material";

import type { HospitalLoad } from "../features/incidents/useHospitalLoad";

interface Props {
  hospitals: HospitalLoad[];
  isLoading?: boolean;
}

const HospitalLoadPanel = ({ hospitals, isLoading }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Hospital Load
    </Typography>
    {isLoading ? (
      <Typography variant="body2">Loading hospital data...</Typography>
    ) : hospitals.length === 0 ? (
      <Typography variant="body2" color="#8ba3c7">
        No hospital stats available.
      </Typography>
    ) : (
      hospitals.map((hospital) => (
        <div key={hospital.name} style={{ marginBottom: "1rem" }}>
          <Typography fontWeight={600}>{hospital.name}</Typography>
          <Typography variant="caption" color="#8ba3c7">
            {hospital.occupied}/{hospital.capacity} beds
          </Typography>
          <LinearProgress
            variant="determinate"
            value={hospital.load_percentage}
            sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
          />
        </div>
      ))
    )}
  </Paper>
);

export default HospitalLoadPanel;
