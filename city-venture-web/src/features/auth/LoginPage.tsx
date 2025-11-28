import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/LoginStyle.css";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import { useBusiness } from "@/src/context/BusinessContext"; // Import Business Context
import PageContainer from "@/src/components/PageContainer";
import LoginForm from "./components/LoginForm";
import { Divider } from "@mui/joy";
import Typography from "@/src/components/Typography";
import Loading from "@/src/components/ui/Loading";

const Login: React.FC = () => {
  const [email, setEmail] = useState("owner1@gmail.com");
  const [password, setPassword] = useState("owner123");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login, logout } = useAuth(); // from AuthProvider
  const { setBusinessId } = useBusiness(); // from BusinessProvider
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!email || !password) {
      setLoginError("Email and password are required");
      return;
    }
    setLoading(true);

    try {
      const loggedInUser = await login(email, password, rememberMe);

      // Show loading screen before redirect
      setShowLoadingScreen(true);

      // Delay to show loading animation
      await new Promise((resolve) => setTimeout(resolve, 4500));

      // Check if user is staff (not Business Owner) and redirect to dashboard
      const staffRoles = [
        "Manager",
        "Room Manager",
        "Receptionist",
        "Sales Associate",
      ];
      const tourism = ["Admin", "Tourism Officer"];
      const tourist = "Tourist";
      const owner = "Business Owner";

      const userRole = loggedInUser.role_name || "";

      if (staffRoles.includes(userRole)) {
        // Staff members: Set their assigned business_id and go to dashboard
        if (loggedInUser.business_id) {
          setBusinessId(loggedInUser.business_id);
        }
        navigate("/business/dashboard");
      } else if (userRole === tourist) {
        // Tourist to landing page
        navigate("/");
      } else if (tourism.includes(userRole)) {
        // Tourism
        navigate("/tourism/dashboard");
      } else if (userRole === owner) {
        // Business Owners go to business listing page
        navigate("/business");
      } else {
        setLoginError("Access Denied");
        logout();
      }
    } catch (err: unknown) {
      const anyErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        anyErr?.response?.data?.message || anyErr?.message || "Login failed.";
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (showLoadingScreen) {
    return (
      <Loading
        variant="splash"
        showProgress
        message="Welcome to City Venture!"
        subtitle="Welcome to City Venture!"
      />
    );
  }

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
            forgotPasswordLink="/forget-password"
            signUpLink="/business-registration"
            size="large"
            title="Sign In"
            subtitle="Navigate with Ease - Your Ultimate City Directory"
            signUpPromptText="Want to register your business?"
            signUpLinkText="Click here"
            showRememberMe={true}
            loading={loading}
          >
            <Divider>Or</Divider>

            <Typography.Body align="center" size={"sm"}>
              Create tourist account
              <Link to={"/register"} style={{ textDecoration: "none" }}>
                <Typography.Body
                  size={"sm"}
                  startDecorator
                  sx={{ color: "#0077B6" }}
                >
                  Sign Up
                </Typography.Body>
              </Link>
            </Typography.Body>
          </LoginForm>
        </div>
      </div>
    </PageContainer>
  );
};

export default Login;
