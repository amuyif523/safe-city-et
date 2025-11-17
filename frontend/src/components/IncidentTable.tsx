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
            <TableCell>Severity</TableCell>
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
              <TableCell>
                <Typography>{incident.incident_type}</Typography>
                {incident.incident_type_confidence && (
                  <Typography variant="caption" color="#8ba3c7">
                    Confidence {(incident.incident_type_confidence * 100).toFixed(0)}%
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip label={incident.status} color={statusColors[incident.status]} />
              </TableCell>
              <TableCell>
                <Chip label={`Score ${incident.severity_score ?? "?"}`} color="secondary" />
              </TableCell>
              <TableCell>{incident.priority}</TableCell>
              <TableCell>{new Date(incident.updated_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {incidents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography variant="body2" color="#8ba3c7">
                  No incidents to display.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default IncidentTable;
