import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import apiClient from "../../lib/api-client";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"public" | "responder">("public");
  const [inviteCode, setInviteCode] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/signup", {
        full_name: fullName,
        email,
        phone,
        password,
        roles: selectedRole === "public" ? ["public"] : ["public", "police"],
        invite_code: selectedRole === "public" ? undefined : inviteCode || undefined,
      });
      setSuccess("Registration complete! Redirecting to login…");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      if (err?.response?.status === 400) {
        setError(err.response?.data?.detail ?? "Email already registered.");
      } else {
        setError("Unable to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      sx={{ backgroundColor: "#010712" }}
    >
      <Box
        flex={1}
        sx={{
          background: "linear-gradient(135deg, #0a1728 0%, #082f52 50%, #0b68b1 100%)",
          color: "#f8fbff",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          p: 8,
          gap: 3,
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          Join Safe City ET
        </Typography>
        <Typography variant="h6">
          Citizens gain access to real-time reporting, status tracking, and critical alerts for their district.
        </Typography>
        <Typography variant="body1" color="rgba(248,251,255,0.9)">
          Your reports help authorities respond faster. Stay informed and keep your community safe.
        </Typography>
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
          sx={{ width: "100%", maxWidth: 500, p: 4, bgcolor: "#050d16" }}
        >
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonAddIcon color="primary" />
              <Typography variant="h5" fontWeight={700}>
                Create Account
              </Typography>
            </Box>
            <TextField
              label="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Phone (optional)"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              fullWidth
            />
            <Typography variant="caption" color="#8ba3c7">
              Choose your role:
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip
                label="Citizen Reporter"
                color={selectedRole === "public" ? "primary" : "default"}
                onClick={() => setSelectedRole("public")}
                clickable
              />
              <Chip
                label="Agency Responder"
                color={selectedRole === "responder" ? "primary" : "default"}
                onClick={() => setSelectedRole("responder")}
                clickable
              />
            </Stack>
            {selectedRole === "responder" && (
              <TextField
                label="Agency Invite Code"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                required
                helperText="Enter the invite code provided by your agency administrator."
              />
            )}
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
            <Typography variant="body2" color="#8ba3c7" textAlign="center">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login" underline="hover">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterPage;
