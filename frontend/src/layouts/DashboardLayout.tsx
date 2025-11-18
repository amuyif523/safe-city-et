import { Alert, Box, Collapse } from "@mui/material";
import { Outlet } from "react-router-dom";

import SidebarNav from "../components/SidebarNav";
import TopBar from "../components/TopBar";
import useNetworkStatus from "../hooks/useNetworkStatus";

const DashboardLayout = () => {
  const isOnline = useNetworkStatus();

  return (
    <Box display="flex" minHeight="100vh">
      <SidebarNav />
      <Box flexGrow={1} display="flex" flexDirection="column">
        <TopBar />
        <Collapse in={!isOnline}>
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            You are offline. Data shown may be stale until connection is restored.
          </Alert>
        </Collapse>
        <Box component="main" flexGrow={1} p={3} bgcolor="#02070c">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
