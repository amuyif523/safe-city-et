import {
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import type { Incident } from "../types/user";

const STATUSES: Incident["status"][] = ["open", "acknowledged", "in_progress", "resolved"];

interface AdminIncidentPanelProps {
  incidents: Incident[];
  isLoading?: boolean;
  onStatusChange: (incidentId: number, status: Incident["status"]) => Promise<void>;
}

const AdminIncidentPanel = ({
  incidents,
  isLoading,
  onStatusChange,
}: AdminIncidentPanelProps) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Incident Moderation
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Reporter</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {incidents.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell>{incident.id}</TableCell>
            <TableCell>{incident.title}</TableCell>
            <TableCell>{incident.priority.toUpperCase()}</TableCell>
            <TableCell>{incident.reported_by?.full_name ?? "—"}</TableCell>
            <TableCell>
              <TextField
                select
                size="small"
                value={incident.status}
                disabled={isLoading}
                onChange={(event) =>
                  onStatusChange(incident.id, event.target.value as Incident["status"])
                }
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
          </TableRow>
        ))}
        {incidents.length === 0 && !isLoading && (
          <TableRow>
            <TableCell colSpan={5}>
              <Typography variant="body2" color="#8ba3c7">
                All incidents are resolved. Great job!
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
);

export default AdminIncidentPanel;
