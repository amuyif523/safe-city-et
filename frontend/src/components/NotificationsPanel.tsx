import { List, ListItem, ListItemText, Paper, Typography } from "@mui/material";

import type { Notification } from "../types/user";

interface Props {
  notifications: Notification[];
}

const NotificationsPanel = ({ notifications }: Props) => (
  <Paper sx={{ bgcolor: "#050d16", color: "#f4f6fb", p: 2 }}>
    <Typography variant="h6" mb={2}>
      Notifications
    </Typography>
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
  </Paper>
);

export default NotificationsPanel;
