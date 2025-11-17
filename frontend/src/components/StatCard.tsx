import { Box, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
}

const StatCard = ({ label, value, trend }: StatCardProps) => (
  <Box
    p={3}
    borderRadius={3}
    bgcolor="#0b1320"
    border="1px solid rgba(255,255,255,0.05)"
  >
    <Typography variant="caption" color="#8ba3c7">
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={700} mt={1}>
      {value}
    </Typography>
    {trend && (
      <Typography variant="body2" color="#4ade80">
        {trend}
      </Typography>
    )}
  </Box>
);

export default StatCard;
