import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import LoginForm from "../components/LoginForm";
import PageContainer from "@/src/components/PageContainer";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("Email and password are required.");
      return;
    }

    try {
      setLoginError("");
      setLoading(true);

      // login() returns the logged-in user - use this instead of stale state
      const loggedInUser = await login(email, password, rememberMe);

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Check the returned user, not the stale state
      // Allow both Admin and Tourism Officer roles for tourism CMS
      const allowedRoles = ["Admin", "Tourism Officer"];
      if (loggedInUser?.role_name && allowedRoles.includes(loggedInUser.role_name)) {
        navigate("/tourism/dashboard");
      } else {
        setLoading(false);
        setLoginError("Unauthorized Access");
      }
    } catch (error: unknown) {
      setLoading(false);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setLoginError(
        err?.response?.data?.message || err?.message || "Login failed."
      );
    }
  };

  return (
    <PageContainer padding={0} style={{ height: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
        }}
      >
        {/* Left Background Image - Hidden on mobile */}
        <div
          style={{
            flex: 1,
            display: "block",
          }}
          className="login-left-container"
        >
          <img
            src="https://www2.naga.gov.ph/wp-content/uploads/2021/10/Aerial-View-Naga-City-ScubaFlyer-PH.jpg"
            width={"100%"}
            height={"100%"}
            style={{
              objectFit: "cover",
            }}
            alt="Naga City Background"
          />
        </div>

        {/* Right Login Form */}
        <div
          className="login-right-container"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoginForm
            email={email}
            password={password}
            rememberMe={rememberMe}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRememberMeChange={setRememberMe}
            onLogin={handleLogin}
            error={loginError}
            forgotPasswordLink="/TouristApp/(screens)/ForgotPassword"
            signUpLink="/tourism/signup"
            size="large"
            title="Sign In"
            subtitle="Navigate with Ease - Your Ultimate City Directory"
            signUpPromptText="Don't Have an Account?"
            signUpLinkText="Sign Up"
            showRememberMe={true}
            loading={loading}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default Login;
