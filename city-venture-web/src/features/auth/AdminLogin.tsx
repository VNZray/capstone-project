import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/src/assets/images/logo.png";
import "./LoginStyle.css";
import Text from "../../components/Text";
import ResponsiveText from "../../components/ResponsiveText";
import Container from "../../components/Container";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import { Input, Button } from "@mui/joy";
import { colors } from "../../utils/Colors";

const Login: React.FC = () => {
  const [email, setEmail] = useState("rayvenclores@gmail.com");
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
        navigate("/admin/dashboard");
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
            <ResponsiveText type="title-small" weight="bold">
              City Venture
            </ResponsiveText>
          </div>

          {/* Title and Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text variant="title" color="dark" style={{ marginBottom: 6 }}>
              Sign In
            </Text>
            <Text variant="paragraph" color="dark" style={{ marginBottom: 24 }}>
              Navigate with Ease - Your Ultimate City Directory
            </Text>
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
              <Text variant="normal" color="secondary-color">
                Forgot Password?
              </Text>
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
              <Text variant="paragraph" color={colors.error}>
                {loginError}
              </Text>
            )}
          </div>

          {/* Sign Up Link */}
          <div className="signup-row">
            <Text variant="normal" color="dark">
              Don't Have an Account?
            </Text>
            <Link to="/tourism/signup" className="link">
              <Text variant="medium" color="secondary-color">
                Sign Up
              </Text>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Login;
