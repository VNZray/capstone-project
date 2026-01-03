import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../old-page/styles/LoginStyle.css";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import PageContainer from "@/src/components/PageContainer";
import LoginForm from "../components/LoginForm";
import { Divider } from "@mui/joy";
import Typography from "@/src/components/Typography";

const Login: React.FC = () => {
  const [email, setEmail] = useState("owner1@gmail.com");
  const [password, setPassword] = useState("owner123");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // from AuthProvider
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

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

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // Check if user is staff (not Business Owner) and redirect to dashboard
      // RBAC Enhancement: Check role_type for custom business roles
      const staffRoles = [
        "Manager",
        "Room Manager",
        "Receptionist",
        "Sales Associate",
      ];

      const tourism = ["Admin", "Tourism Office"];
      const tourist = "Tourist";
      const owner = "Business Owner";

      const userRole = loggedInUser.role_name || "";
      const roleType = loggedInUser.role_type;
      const isCustomBusinessRole = roleType === 'business';

      // Custom business roles should be treated as staff
      if (isCustomBusinessRole || staffRoles.includes(userRole)) {
        // Staff members and custom roles go directly to business dashboard
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
              <Link to={"/tourist/login"} style={{ textDecoration: "none" }}>
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
