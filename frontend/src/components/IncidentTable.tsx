import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { Incident } from "../types/user";

interface Props {
  incidents: Incident[];
}

const statusColors: Record<Incident["status"], "default" | "success" | "warning" | "error"> = {
  open: "warning",
  acknowledged: "default",
  in_progress: "warning",
  resolved: "success",
};

const IncidentTable = ({ incidents }: Props) => {
  return (
    <Paper sx={{ bgcolor: "#050d16", color: "#f4f6fb" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Incident</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell>
                <Typography fontWeight={600}>{incident.title}</Typography>
                <Typography variant="caption" color="#8ba3c7">
                  {incident.description.slice(0, 80)}...
                </Typography>
              </TableCell>
              <TableCell>{incident.incident_type}</TableCell>
              <TableCell>
                <Chip label={incident.status} color={statusColors[incident.status]} />
              </TableCell>
              <TableCell>{incident.priority}</TableCell>
              <TableCell>{new Date(incident.updated_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default IncidentTable;
