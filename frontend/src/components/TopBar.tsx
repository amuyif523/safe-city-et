import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Menu,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useState } from "react";

import useAuth from "../hooks/useAuth";
import useNotifications from "../features/notifications/useNotifications";

const TopBar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const latestNotifications = notifications.slice(0, 6);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={3}
      py={2}
      borderBottom="1px solid rgba(255,255,255,0.08)"
    >
      <OutlinedInput
        placeholder="Search incidents, agencies, alerts..."
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "#8ba3c7" }} />
          </InputAdornment>
        }
        sx={{ width: "40%", color: "#e4ecff" }}
      />
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton color="primary" onClick={handleOpenMenu}>
          <Badge color="error" badgeContent={unreadCount} max={9}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        <Menu
          open={open}
          onClose={handleCloseMenu}
          anchorEl={anchorEl}
          PaperProps={{ sx: { width: 340, bgcolor: "#050d16" } }}
        >
          <Box px={2} py={1} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1">Notifications</Typography>
            <Button size="small" onClick={() => void markAllAsRead()}>
              Mark all read
            </Button>
          </Box>
          <Divider />
          {isLoading ? (
            <Box p={2} display="flex" justifyContent="center">
              <CircularProgress size={20} />
            </Box>
          ) : latestNotifications.length === 0 ? (
            <Typography variant="body2" color="#8ba3c7" px={2} py={3}>
              No alerts yet.
            </Typography>
          ) : (
            <List disablePadding>
              {latestNotifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  divider
                  sx={{
                    bgcolor: notification.is_read ? "transparent" : "rgba(10,168,255,0.08)",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    if (!notification.is_read) {
                      await markAsRead(notification.id);
                    }
                    handleCloseMenu();
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={new Date(notification.created_at).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Box px={2} py={1}>
            <Typography variant="caption" color="#8ba3c7">
              Showing latest {latestNotifications.length} notifications
            </Typography>
          </Box>
        </Menu>
        {user && (
          <>
            <Avatar sx={{ bgcolor: "#0aa8ff" }}>
              {user.full_name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Avatar>
            <Box textAlign="right">
              <Typography fontWeight={600}>{user.full_name}</Typography>
              <Typography variant="caption" color="#8ba3c7">
                {user.roles.map((role) => role.name).join(", ")}
              </Typography>
            </Box>
            <Button variant="outlined" color="inherit" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TopBar;
