import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import type { Notification } from "../types/user";

interface Props {
  notifications: Notification[];
  isLoading?: boolean;
}

const NotificationsPanel = ({ notifications, isLoading }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", color: "#f4f6fb", p: 2 }}>
    <Typography variant="h6" mb={2}>
      Notifications
    </Typography>
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
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
);

export default NotificationsPanel;
