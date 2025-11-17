import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import type { User } from "../types/user";

interface UserManagementTableProps {
  users: User[];
  isLoading?: boolean;
  onToggleActive: (userId: number, isActive: boolean) => Promise<void>;
}

const UserManagementTable = ({ users, isLoading, onToggleActive }: UserManagementTableProps) => (
  <Paper sx={{ bgcolor: "#050d16", p: 3 }}>
    <Typography variant="h6" mb={2}>
      Agency Accounts
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Roles</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.full_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {user.roles.map((role) => (
                <Chip key={role.id} label={role.name} size="small" sx={{ mr: 0.5 }} />
              ))}
            </TableCell>
            <TableCell>
              <Chip
                label={user.is_active ? "Active" : "Disabled"}
                color={user.is_active ? "success" : "default"}
                size="small"
              />
            </TableCell>
            <TableCell align="right">
              <Tooltip title={user.is_active ? "Disable account" : "Enable account"}>
                <span>
                  <IconButton
                    color={user.is_active ? "warning" : "success"}
                    size="small"
                    disabled={isLoading}
                    onClick={() => onToggleActive(user.id, !user.is_active)}
                  >
                    {user.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
        {users.length === 0 && !isLoading && (
          <TableRow>
            <TableCell colSpan={5}>
              <Typography variant="body2" color="#8ba3c7">
                No users found.
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
);

export default UserManagementTable;
