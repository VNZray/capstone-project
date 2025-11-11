import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/src/assets/images/logo.png";
import "./LoginStyle.css";
import Typography from "@/src/components/Typography";
import Container from "../../components/Container";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import { Input, Button } from "@mui/joy";
import { colors } from "../../utils/Colors";

const Login: React.FC = () => {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login, user } = useAuth(); // from AuthProvider

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("Email and password are required.");
      return;
    }

    try {
      setLoginError("");

      await login(email, password);

      if (user?.role_name === "Admin") {
        navigate("/tourism/dashboard");
      }
    } catch (error: any) {
      setLoginError(
        error?.response?.data?.message || error?.message || "Login failed."
      );
    }
  };

  return (
    <div className="login-container">
      {/* Left Background Image */}
      <div className="left-container">
        <img
          src="https://i0.wp.com/nagayon.com/wp-content/uploads/2024/08/oragon-monument-by-colline.jpg"
          alt="Background"
          className="background-image"
        />
      </div>

      {/* Right Login Form */}
      <div className="right-container">
        <Container elevation={3} padding="40px" radius="0.5rem" width="450px">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            <Typography.Title size="sm">
              City Venture
            </Typography.Title>
          </div>

          {/* Title and Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography.Title size="lg" sx={{ mb: 0.75 }}>
              Sign In
            </Typography.Title>
            <Typography.Body size="md" sx={{ mb: 3 }}>
              Navigate with Ease - Your Ultimate City Directory
            </Typography.Body>
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <Input
              variant="soft"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="lg"
            />

            <Input
              type="password"
              variant="soft"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
            />

            <Link to="/TouristApp/(screens)/ForgotPassword" className="link">
              <Typography.Body size="sm" sx={{ color: "#0077B6" }}>
                Forgot Password?
              </Typography.Body>
            </Link>
          </div>

          {/* Login Button */}
          <div
            style={{
              marginTop: 20,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Button
              color="primary"
              onClick={handleLogin}
              size="lg"
              variant="solid"
              style={{ flex: 1, minHeight: "50px" }}
            >
              Sign In
            </Button>

            {loginError && (
              <Typography.Body size="md" sx={{ color: colors.error, mt: 2 }}>
                {loginError}
              </Typography.Body>
            )}
          </div>

          {/* Sign Up Link */}
          <div className="signup-row">
            <Typography.Body size="sm">
              Don't Have an Account?
            </Typography.Body>
            <Link to="/tourism/signup" className="link">
              <Typography.Body size="sm" weight="semibold" sx={{ color: "#0077B6" }}>
                Sign Up
              </Typography.Body>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Login;
