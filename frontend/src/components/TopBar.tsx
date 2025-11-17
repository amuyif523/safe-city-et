import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";

import useAuth from "../hooks/useAuth";

const TopBar = () => {
  const { user, logout } = useAuth();

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
        <IconButton color="primary">
          <NotificationsNoneIcon />
        </IconButton>
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
