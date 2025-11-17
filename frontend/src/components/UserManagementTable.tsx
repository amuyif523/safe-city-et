import {
  Button,
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
  onToggleDisabled: (userId: number, isDisabled: boolean) => Promise<void>;
  onToggleSuspended: (userId: number, isSuspended: boolean, reason?: string | null) => Promise<void>;
}

const UserManagementTable = ({
  users,
  isLoading,
  onToggleActive,
  onToggleDisabled,
  onToggleSuspended,
}: UserManagementTableProps) => (
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
                label={user.is_active ? "Active" : "Inactive"}
                color={user.is_active ? "success" : "default"}
                size="small"
                sx={{ mr: 0.5 }}
              />
              {user.is_disabled && (
                <Chip label="Disabled" color="default" size="small" sx={{ mr: 0.5 }} />
              )}
              {user.is_suspended && (
                <Chip label="Suspended" color="warning" size="small" />
              )}
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
              <Tooltip title={user.is_disabled ? "Re-enable account" : "Permanently disable"}>
                <span>
                  <IconButton
                    color="error"
                    size="small"
                    disabled={isLoading}
                    onClick={() => onToggleDisabled(user.id, !user.is_disabled)}
                  >
                    {user.is_disabled ? <CheckCircleIcon /> : <BlockIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="text"
                size="small"
                disabled={isLoading}
                onClick={async () => {
                  if (user.is_suspended) {
                    await onToggleSuspended(user.id, false);
                  } else {
                    const reason = window.prompt(
                      "Enter suspension reason",
                      user.suspension_reason ?? ""
                    );
                    if (reason !== null) {
                      await onToggleSuspended(user.id, true, reason);
                    }
                  }
                }}
              >
                {user.is_suspended ? "Unsuspend" : "Suspend"}
              </Button>
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
