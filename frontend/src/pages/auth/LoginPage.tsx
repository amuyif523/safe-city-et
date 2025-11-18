import LockOpenIcon from "@mui/icons-material/LockOpen";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import apiClient from "../../lib/api-client";
import { useAuthStore } from "../../stores/useAuthStore";
import type { User } from "../../types/user";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      const { data } = await apiClient.post<{ access_token: string; refresh_token?: string }>(
        "/auth/login",
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const profile = await apiClient.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setAuth({ token: data.access_token, refreshToken: data.refresh_token, user: profile.data });
      const redirectPath = (location.state as any)?.from?.pathname ?? "/";
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError("Too many attempts. Please wait before trying again.");
      } else if (err?.response?.status === 403) {
        setError(err.response?.data?.detail ?? "Account not authorized.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetError(null);
    setResetMessage(null);
    try {
      await apiClient.post("/auth/request-password-reset", { email: resetEmail });
      setResetMessage("If that email exists, you'll receive reset instructions shortly.");
    } catch {
      setResetError("We couldn't initiate the reset. Please try again.");
    }
  };

  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        sx={{ backgroundColor: "#010712" }}
      >
        <Box
          flex={1}
          sx={{
            background: "linear-gradient(135deg, #010712 0%, #081f3b 45%, #0a559d 100%)",
            color: "#f8fbff",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            p: 8,
            gap: 3,
          }}
        >
          <Typography variant="h3" fontWeight={700}>
            SAFE CITY ET
          </Typography>
          <Typography variant="h6">
            Unified emergency management for citizens, responders, and command centers.
          </Typography>
          <Stack spacing={2}>
            <Typography variant="body1" color="rgba(248,251,255,0.9)">
              • Real-time incident triage powered by AI intelligence.
            </Typography>
            <Typography variant="body1" color="rgba(248,251,255,0.9)">
              • Multi-agency dashboards with geospatial overlays.
            </Typography>
            <Typography variant="body1" color="rgba(248,251,255,0.9)">
              • Secure communications and audit-ready controls.
            </Typography>
          </Stack>
        </Box>
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ bgcolor: "#050b15", p: { xs: 3, md: 6 } }}
        >
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={8}
            sx={{ width: "100%", maxWidth: 420, p: 4, bgcolor: "#050d16" }}
          >
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <LockOpenIcon color="primary" />
                <Typography variant="h5" fontWeight={700}>
                  Command Access
                </Typography>
              </Box>
              <Typography variant="body2" color="#8ba3c7">
                Enter your credentials to access the Safe City command center.
              </Typography>
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Link component={RouterLink} to="/register" underline="hover">
                  Need an account?
                </Link>
                <Link component="button" underline="hover" onClick={() => setResetOpen(true)}>
                  Forgot password?
                </Link>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Enter the email associated with your account. If it exists, we'll email reset instructions.
          </Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={resetEmail}
            onChange={(event) => setResetEmail(event.target.value)}
          />
          {resetMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {resetMessage}
            </Alert>
          )}
          {resetError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {resetError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Close</Button>
          <Button onClick={handlePasswordReset} variant="contained">
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginPage;
