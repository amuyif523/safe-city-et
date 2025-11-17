import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { ROLE_LABELS } from "../config/roles";
import apiClient from "../lib/api-client";

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const NotificationBroadcastForm = () => {
  const [message, setMessage] = useState("");
  const [eventType, setEventType] = useState("broadcast");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>(["in_app"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const activeChannels = channels.length ? channels : ["in_app"];
      await apiClient.post("/notifications/broadcast", {
        message,
        event_type: eventType,
        target_roles: targetRoles.length ? targetRoles : null,
        channels: activeChannels,
      });
      setFeedback({ type: "success", text: "Broadcast sent successfully." });
      setMessage("");
      setTargetRoles([]);
      setChannels(["in_app"]);
    } catch {
      setFeedback({ type: "error", text: "Failed to send broadcast." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: "#050d16", p: 3, borderRadius: 3 }}>
      <Typography variant="h6" mb={2}>
        Command Broadcast
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Event Type"
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
          select
        >
          <MenuItem value="broadcast">Broadcast</MenuItem>
          <MenuItem value="alert">High Priority Alert</MenuItem>
          <MenuItem value="system">System Message</MenuItem>
        </TextField>
        <TextField
          label="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          multiline
          minRows={3}
          required
        />
        <Box>
          <Typography variant="caption" color="#8ba3c7">
            Target Roles (optional)
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {roleOptions.map((role) => (
              <Chip
                key={role.value}
                label={role.label}
                color={targetRoles.includes(role.value) ? "primary" : "default"}
                onClick={() =>
                  setTargetRoles((prev) =>
                    prev.includes(role.value)
                      ? prev.filter((value) => value !== role.value)
                      : [...prev, role.value]
                  )
                }
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="caption" color="#8ba3c7">
            Channels
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {["in_app", "email", "sms"].map((channel) => (
              <Chip
                key={channel}
                label={channel.toUpperCase()}
                color={channels.includes(channel) ? "primary" : "default"}
                onClick={() =>
                  setChannels((prev) =>
                    prev.includes(channel)
                      ? prev.filter((value) => value !== channel)
                      : [...prev, channel]
                  )
                }
              />
            ))}
          </Stack>
        </Box>
        {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Broadcast"}
        </Button>
      </Stack>
    </Box>
  );
};

export default NotificationBroadcastForm;
