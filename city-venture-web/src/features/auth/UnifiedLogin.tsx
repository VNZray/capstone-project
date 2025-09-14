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
import "./LoginUnified.css";

type Role = "tourist" | "owner" | "admin";

const roleToLabel: Record<Role, string> = {
  tourist: "Tourist",
  owner: "Business Owner",
  admin: "Admin",
};

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const { loginTourist, loginOwner, loginTourism } = useAuth();

  const [role, setRole] = useState<Role>("tourist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
      if (role === "tourist") {
        await loginTourist(email, password);
        navigate("/");
      } else if (role === "owner") {
        await loginOwner(email, password);
        navigate("/business");
      } else {
        await loginTourism(email, password);
        navigate("/tourism/dashboard");
      }
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
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
        <Card className="ul-card" variant="outlined">
          <div className="ul-card-header">
            <Typography level="h3" fontWeight={800}>
              Welcome back
            </Typography>
            <Typography level="body-md" sx={{ color: "#6B7280" }}>
              Sign in to continue your journey
            </Typography>
          </div>

          <Tabs value={role} onChange={(_, v) => setRole(v as Role)}>
            <TabList className="ul-tablist">
              <Tab value="tourist">Tourist</Tab>
              <Tab value="owner">Business Owner</Tab>
              <Tab value="admin">Admin</Tab>
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
                endDecorator={
                  <IconButton
                    variant="plain"
                    color="neutral"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />
            </FormControl>

            <div className="ul-actions">
              <Button
                type="submit"
                loading={loading}
                size="lg"
                fullWidth
              >
                {submitLabel}
              </Button>
            </div>
          </form>

          <div className="ul-footer">
            {role === "owner" && (
              <Typography level="body-sm">
                New to City Venture?{" "}
                <Link to="/business/signup" className="ul-link">
                  Create a business account
                </Link>
              </Typography>
            )}
            {role === "admin" && (
              <Typography level="body-sm">
                No admin account yet?{" "}
                <Link to="/tourism/signup" className="ul-link">
                  Request access
                </Link>
              </Typography>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
