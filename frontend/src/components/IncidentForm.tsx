import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import apiClient from "../lib/api-client";

interface IncidentFormProps {
  onSuccess?: () => void;
}

const priorities = ["low", "medium", "high"] as const;

const IncidentForm = ({ onSuccess }: IncidentFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof priorities)[number]>("medium");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setLatitude("");
    setLongitude("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiClient.post("/incidents", {
        title,
        description,
        priority,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });
      setSuccessMessage("Incident reported successfully.");
      resetForm();
      onSuccess?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage("Failed to submit incident. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: "#050d16", p: 3, borderRadius: 3 }}>
      <Typography variant="h6" mb={2}>
        Report an Incident
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          minRows={3}
          required
        />
        <TextField
          label="Priority"
          select
          value={priority}
          onChange={(event) => setPriority(event.target.value as (typeof priorities)[number])}
          required
        >
          {priorities.map((option) => (
            <MenuItem key={option} value={option}>
              {option.toUpperCase()}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Latitude"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            fullWidth
          />
          <TextField
            label="Longitude"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            fullWidth
          />
        </Stack>
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Incident"}
        </Button>
      </Stack>
    </Box>
  );
};

export default IncidentForm;
