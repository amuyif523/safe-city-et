import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Box, Typography } from "@mui/material";

import type { Incident } from "../types/user";

interface Props {
  incidents: Incident[];
}

const CommandCenterMap = ({ incidents }: Props) => (
  <Box borderRadius={3} overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <MapContainer
      center={[9.03, 38.74]}
      zoom={11}
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {incidents
        .filter((i) => i.latitude && i.longitude)
        .map((incident) => (
          <CircleMarker
            key={incident.id}
            center={[incident.latitude!, incident.longitude!]}
            radius={10}
            pathOptions={{
              color:
                incident.priority === "high"
                  ? "#f87171"
                  : incident.priority === "medium"
                  ? "#fbbf24"
                  : "#34d399",
            }}
          >
            <Popup>
              <Typography variant="subtitle2">{incident.title}</Typography>
              <Typography variant="body2">{incident.description}</Typography>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  </Box>
);

export default CommandCenterMap;
