/**
 * Change Password Page
 * 
 * Displayed when staff member logs in with must_change_password=true.
 * Requires staff to set a new password before accessing the application.
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/joy";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/context/AuthContext";
import {
  changePassword,
  completeStaffProfile,
  logoutUser,
} from "@/src/services/auth/AuthService";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      // Change password
      const result = await changePassword(currentPassword, newPassword);

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Also complete profile since password change is the main requirement
      await completeStaffProfile();

      setSuccess(true);

      // Redirect after brief success message
      setTimeout(() => {
        // Get the intended destination or default to dashboard
        const from = (location.state as any)?.from?.pathname || "/business";
        window.location.href = from; // Force full reload to refresh user state
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          p: 4,
          boxShadow: "lg",
        }}
      >
        <Container padding="0" gap="24px">
          {/* Header */}
          <Container padding="0" gap="8px" align="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <Lock sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Typography.Title size="sm">Change Your Password</Typography.Title>
            <Typography.Body size="sm" sx={{ textAlign: "center", color: "neutral.600" }}>
              For security, you must set a new password before continuing.
              Your temporary password was sent via email.
            </Typography.Body>
          </Container>

          {/* Success Message */}
          {success && (
            <Alert color="success" variant="soft">
              Password changed successfully! Redirecting...
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert color="danger" variant="soft">
              {error}
            </Alert>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit}>
              <Container padding="0" gap="16px">
                <FormControl>
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your temporary password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                    endDecorator={
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          p: 0,
                          display: "flex",
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Box>
                    }
                  />
                  <FormHelperText>
                    This is the password sent to your email
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <FormHelperText>
                    Min 8 characters, with uppercase, lowercase, and number
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  startDecorator={loading ? <CircularProgress size="sm" /> : undefined}
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </Button>

                <Button
                  type="button"
                  variant="tertiary"
                  size="md"
                  fullWidth
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Logout Instead
                </Button>
              </Container>
            </form>
          )}

          {/* User Info */}
          {user && (
            <Typography.Body size="sm" sx={{ textAlign: "center", color: "neutral.500" }}>
              Logged in as: {user.email}
            </Typography.Body>
          )}
        </Container>
      </Card>
    </Box>
  );
}
