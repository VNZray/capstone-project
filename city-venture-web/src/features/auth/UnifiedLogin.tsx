import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import logo from "@/src/assets/images/logo.png";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Tab,
  TabList,
  Tabs,
  Typography,
  IconButton,
  Alert,
  Card,
} from "@mui/joy";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailRounded from "@mui/icons-material/EmailRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import GoogleIcon from "@mui/icons-material/Google";
import Divider from "@mui/joy/Divider";
import Checkbox from "@mui/joy/Checkbox";
import "./LoginUnified.css";

type Role = "Tourist" | "Owner" | "Admin";

const roleToLabel: Record<Role, string> = {
  Tourist: "Tourist",
  Owner: "Business Owner",
  Admin: "Admin",
};

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("Tourist");
  const [email, setEmail] = useState("rayvenclores@gmail.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const submitLabel = useMemo(() => `Sign in as ${roleToLabel[role]}`, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      if (role === "Tourist") {
        await login(email, password);
        navigate("/");
      } else if (role === "Owner") {
        await login(email, password);
        navigate("/business");
      } else {
        await login(email, password);
        navigate("/tourism/dashboard");
      }
    } catch (err: unknown) {
      const anyErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        anyErr?.response?.data?.message || anyErr?.message || "Login failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ul-wrapper">
      <div className="ul-hero">
        <div className="ul-hero-overlay" />
        <div className="ul-hero-content">
          <img src={logo} alt="City Venture" className="ul-logo" />
          <Typography level="h2" sx={{ color: "#fff", fontWeight: 800 }}>
            City Venture
          </Typography>
          <Typography level="body-lg" sx={{ color: "#E5E7EB" }}>
            Navigate with Ease — Your Ultimate City Directory
          </Typography>
        </div>
      </div>

      <div className="ul-form-col">
        <Card
          className="ul-card"
          variant="outlined"
          sx={{ borderRadius: 18, p: 3, boxShadow: "sm" }}
        >
          <div
            className="ul-card-header"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <img
              src={logo}
              alt="City Venture"
              width={36}
              height={36}
              style={{ borderRadius: 8 }}
            />
            <div>
              <Typography level="h4" fontWeight={800}>
                Nice to see you again
              </Typography>
              <Typography level="body-sm" sx={{ color: "#6B7280" }}>
                Sign in to continue your journey
              </Typography>
            </div>
          </div>

          <Tabs
            value={role}
            onChange={(_, v) => setRole(v as Role)}
            sx={{ mt: 2 }}
          >
            <TabList
              className="ul-tablist"
              sx={{
                bgcolor: "background.level1",
                borderRadius: 12,
                p: 0.5,
                gap: 0.5,
              }}
            >
              <Tab value="Tourist" sx={{ borderRadius: 10, flex: 1 }}>
                <Typography level="body-sm">Tourist</Typography>
              </Tab>
              <Tab value="Owner" sx={{ borderRadius: 10, flex: 1 }}>
                <Typography level="body-sm">Business Owner</Typography>
              </Tab>
              <Tab value="Admin" sx={{ borderRadius: 10, flex: 1 }}>
                <Typography level="body-sm">Admin</Typography>
              </Tab>
            </TabList>
          </Tabs>

          {error && (
            <Alert color="danger" variant="soft" className="ul-alert">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="ul-form">
            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                startDecorator={<EmailRounded fontSize="small" />}
                disabled={loading}
              />
            </FormControl>

            <FormControl required>
              <FormLabel>Password</FormLabel>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                startDecorator={<LockRounded fontSize="small" />}
                endDecorator={
                  <IconButton
                    variant="plain"
                    color="neutral"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
                disabled={loading}
              />
            </FormControl>

            <div
              className="ul-actions"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Checkbox
                label="Remember me"
                checked={remember}
                onChange={(e) =>
                  setRemember((e.target as HTMLInputElement).checked)
                }
              />
              <Link
                to={
                  role === "Admin"
                    ? "/tourism/forgot"
                    : role === "Owner"
                    ? "/business/forgot"
                    : "/forgot"
                }
                className="ul-link"
              >
                Forgot password?
              </Link>
            </div>

            <div className="ul-actions" style={{ marginTop: 10 }}>
              <Button type="submit" loading={loading} size="lg" fullWidth>
                {submitLabel}
              </Button>
            </div>
          </form>

          <Divider sx={{ my: 2 }}>or</Divider>

          <Button
            variant="outlined"
            color="neutral"
            size="lg"
            startDecorator={<GoogleIcon />}
            fullWidth
            disabled={loading}
            onClick={() => alert("Google sign-in not wired yet")}
            sx={{ mb: 1 }}
          >
            Continue with Google
          </Button>

          <div className="ul-footer">
            {role === "Owner" && (
              <Typography textAlign="center" level="body-sm">
                New to City Venture?{" "}
                <Link to="/business/signup" className="ul-link">
                  Register your business
                </Link>
              </Typography>
            )}
            {role === "Admin" && (
              <Typography textAlign="center" level="body-sm">
                No admin account yet?{" "}
                <Link to="/tourism/signup" className="ul-link">
                  Request access
                </Link>
              </Typography>
            )}
            {role === "Tourist" && (
              <Typography textAlign="center" level="body-sm">
                Don’t have an account?{" "}
                <Link to="/signup" className="ul-link">
                  Sign up now
                </Link>
              </Typography>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
