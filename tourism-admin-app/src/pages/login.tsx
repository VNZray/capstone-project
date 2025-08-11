import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "./LoginStyle.css";
import Text from "../components/Text";
import Container from "../components/Container";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import Input from "../components/Input";

const Login: React.FC = () => {
  const [email, setEmail] = useState("rayventzy@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // from AuthProvider

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("Email and password are required.");
      return;
    }

    try {
      setLoginError("");
      await login(email, password);
      navigate("/dashboard"); // redirect after successful login
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
            <Text variant="header-title" color="dark">
              City Venture
            </Text>
          </div>

          {/* Title and Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text variant="title" color="dark">
              Sign In
            </Text>
            <Text variant="paragraph" color="dark">
              Navigate with Ease - Your Ultimate City Directory
            </Text>
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
            />

            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
            />

            <Link to="/TouristApp/(screens)/ForgotPassword" className="link">
              <Text variant="normal" color="secondary-color">
                Forgot Password?
              </Text>
            </Link>
          </div>

          {/* Login Button */}
          <div style={{ marginTop: 20 }}>
            <button className="login-button" onClick={handleLogin}>
              <Text variant="bold" color="white">
                Sign In
              </Text>
            </button>
            {loginError && (
              <Text variant="paragraph" className="error-text">
                {loginError}
              </Text>
            )}
          </div>

          {/* Sign Up Link */}
          <div className="signup-row">
            <Text variant="normal" color="dark">
              Don't Have an Account?
            </Text>
            <Link to="/register" className="link">
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
