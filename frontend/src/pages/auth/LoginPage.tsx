import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import apiClient from "../../lib/api-client";
import { useAuthStore } from "../../stores/useAuthStore";
import type { User } from "../../types/user";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      const { data } = await apiClient.post<{ access_token: string }>(
        "/auth/login",
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const profile = await apiClient.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setAuth({ token: data.access_token, user: profile.data });
      const redirectPath = (location.state as any)?.from?.pathname ?? "/";
      navigate(redirectPath, { replace: true });
    } catch {
      setError("Invalid credentials.");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#02070c"
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: 360, p: 4, bgcolor: "#050d16" }}
      >
        <Typography variant="h5" mb={2}>
          Safe City Login
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            required
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          <Button variant="contained" type="submit" fullWidth>
            Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
