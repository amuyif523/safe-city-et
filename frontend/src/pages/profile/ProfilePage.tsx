import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import useAuth from "../../hooks/useAuth";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Box maxWidth={720}>
      <Typography variant="h4" mb={2}>
        Profile
      </Typography>
      <Paper sx={{ p: 3, bgcolor: "#050d16" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Avatar sx={{ bgcolor: "#0aa8ff", width: 72, height: 72, fontSize: 32 }}>
            {user.full_name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h5">{user.full_name}</Typography>
            <Typography variant="body2" color="#8ba3c7">
              {user.email}
            </Typography>
            {user.phone && (
              <Typography variant="body2" color="#8ba3c7">
                {user.phone}
              </Typography>
            )}
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              <Chip
                label={user.is_active ? "Active" : "Inactive"}
                color={user.is_active ? "success" : "default"}
              />
              {user.is_disabled && <Chip label="Disabled" color="default" />}
              {user.is_suspended && (
                <Chip
                  label={`Suspended${user.suspension_reason ? `: ${user.suspension_reason}` : ""}`}
                  color="warning"
                />
              )}
            </Stack>
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              {user.roles.map((role) => (
                <Chip key={role.id} label={role.name} variant="outlined" />
              ))}
            </Stack>
          </Box>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Stack>
        <Box mt={3}>
          <Typography variant="subtitle2" color="#8ba3c7">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Typography>
          <Typography variant="subtitle2" color="#8ba3c7">
            Last updated {new Date(user.updated_at).toLocaleString()}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
