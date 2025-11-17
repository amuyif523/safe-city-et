import type { ReactNode } from "react";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { NavLink } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import type { RoleName } from "../types/user";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  roles: RoleName[];
}

const items: NavItem[] = [
  { label: "Public", to: "/", icon: <PublicIcon />, roles: ["public"] },
  { label: "Police", to: "/police", icon: <LocalPoliceIcon />, roles: ["police"] },
  { label: "Fire", to: "/fire", icon: <LocalFireDepartmentIcon />, roles: ["fire"] },
  { label: "Medical", to: "/medical", icon: <LocalHospitalIcon />, roles: ["medical"] },
  { label: "Military", to: "/military", icon: <MilitaryTechIcon />, roles: ["military"] },
  {
    label: "Admin",
    to: "/admin",
    icon: <AdminPanelSettingsIcon />,
    roles: ["admin", "super_admin"],
  },
];

const SidebarNav = () => {
  const { user, hasRole } = useAuth();

  return (
    <Box
      width={240}
      sx={{
        background: "linear-gradient(180deg, #0b1a2b 0%, #04080f 100%)",
        color: "#e4ecff",
        p: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={2}>
        SAFE CITY ET
      </Typography>
      <List>
        {items
          .filter((item) => hasRole(item.roles) || (!user && item.to === "/"))
          .map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 2,
                color: "#e4ecff",
                "&.active": { backgroundColor: "rgba(255,255,255,0.08)" },
              }}
            >
              <ListItemIcon sx={{ color: "#6ee7ff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
      </List>
    </Box>
  );
};

export default SidebarNav;
