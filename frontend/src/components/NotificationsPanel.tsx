import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import type { Notification } from "../types/user";

interface Props {
  notifications: Notification[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onMarkRead?: (notificationId: number) => void;
}

const NotificationsPanel = ({ notifications, isLoading, onRefresh, onMarkRead }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", color: "#f4f6fb", p: 2 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="h6">Notifications</Typography>
      {onRefresh && (
        <Button size="small" onClick={onRefresh}>
          Refresh
        </Button>
      )}
    </Box>
    {isLoading ? (
      <CircularProgress size={20} />
    ) : notifications.length === 0 ? (
      <Typography variant="body2" color="#8ba3c7">
        No notifications yet.
      </Typography>
    ) : (
      <List>
        {notifications.map((notification) => (
          <ListItem key={notification.id} divider>
            <ListItemText
              primary={notification.message}
              secondary={new Date(notification.created_at).toLocaleString()}
            />
            {!notification.is_read && onMarkRead && (
              <ListItemSecondaryAction>
                <Button size="small" onClick={() => onMarkRead(notification.id)}>
                  Mark read
                </Button>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
);

export default NotificationsPanel;
