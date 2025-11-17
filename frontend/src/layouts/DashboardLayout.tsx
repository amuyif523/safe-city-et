import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import SidebarNav from "../components/SidebarNav";
import TopBar from "../components/TopBar";

const DashboardLayout = () => {
  return (
    <Box display="flex" minHeight="100vh">
      <SidebarNav />
      <Box flexGrow={1} display="flex" flexDirection="column">
        <TopBar />
        <Box component="main" flexGrow={1} p={3} bgcolor="#02070c">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
