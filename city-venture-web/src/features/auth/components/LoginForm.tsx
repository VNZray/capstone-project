import React from "react";
import { Link } from "react-router-dom";
import { Input, Button, Checkbox } from "@mui/joy";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import logo from "@/src/assets/images/logo.png";
import { colors } from "@/src/utils/Colors";

export interface LoginFormProps {
  // Form Values
  email: string;
  password: string;
  rememberMe?: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRememberMeChange?: (checked: boolean) => void;

  // Actions
  onLogin:
    | (() => void)
    | ((e: React.FormEvent) => void)
    | (() => Promise<void>);
  // Links
  forgotPasswordLink?: string;
  signUpLink?: string;

  // Text customization
  title?: string;
  subtitle?: string;
  signUpPromptText?: string;
  signUpLinkText?: string;

  // Error handling
  error?: string;

  // Size variants
  size?: "small" | "default" | "medium" | "large";

  // Optional customization
  showLogo?: boolean;
  logoSrc?: string;
  appName?: string;
  showRememberMe?: boolean;

  // Loading state
  loading?: boolean;
  children?: React.ReactNode;
}

const LoginForm: React.FC<LoginFormProps> = ({
  children,
  email,
  password,
  rememberMe = false,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onLogin,
  forgotPasswordLink,
  signUpLink,
  title = "Sign In",
  subtitle = "Navigate with Ease - Your Ultimate City Directory",
  signUpPromptText = "Don't Have an Account?",
  signUpLinkText = "Sign Up",
  error,
  size = "default",
  showLogo = true,
  logoSrc = logo,
  appName = "City Venture",
  showRememberMe = true,
  loading = false,
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      containerPadding: "24px",
      inputSize: "md" as const,
      buttonHeight: "40px",
      titleSize: "md" as const,
      logoHeight: "32px",
      gap: "12px",
    },
    default: {
      containerPadding: "32px",
      inputSize: "lg" as const,
      buttonHeight: "50px",
      titleSize: "lg" as const,
      logoHeight: "40px",
      gap: "16px",
    },
    medium: {
      containerPadding: "40px",
      inputSize: "lg" as const,
      buttonHeight: "54px",
      titleSize: "lg" as const,
      logoHeight: "48px",
      gap: "20px",
    },
    large: {
      containerPadding: "48px",
      inputSize: "lg" as const,
      buttonHeight: "60px",
      titleSize: "lg" as const,
      logoHeight: "56px",
      gap: "24px",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      style={{
        width: "100%",
        maxWidth:
          size === "small" ? "350px" : size === "large" ? "550px" : "450px",
        margin: "0 auto",
      }}
    >
      <Container
        elevation={3}
        padding={config.containerPadding}
        radius="0.5rem"
        style={{
          flex: 1,
        }}
      >
        {/* Logo and App Name */}
        {showLogo && (
          <Container direction="row" padding="0" gap="8px" align="center">
            <img
              src={logoSrc}
              alt="Logo"
              style={{ height: config.logoHeight, objectFit: "contain" }}
            />
            <Typography.Header
              size={size === "small" ? "xs" : size === "large" ? "md" : "sm"}
            >
              {appName}
            </Typography.Header>
          </Container>
        )}

        {/* Title and Subtitle */}
        <Container direction="column" padding="0" gap="0">
          <Typography.CardTitle size={config.titleSize} sx={{ mb: 0.75 }}>
            {title}
          </Typography.CardTitle>
          <Typography.CardSubTitle
            sx={{
              mb: size === "small" ? 2 : 3,
              fontSize: size === "small" ? "0.875rem" : "1rem",
            }}
          >
            {subtitle}
          </Typography.CardSubTitle>
        </Container>

        {/* Form Fields */}
        <Container padding="0" gap={config.gap}>
          <Input
            variant="soft"
            type="email"
            placeholder="e.g. example@gmail.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            size={config.inputSize}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onLogin(e as any);
              }
            }}
          />

          <Input
            type="password"
            variant="soft"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            size={config.inputSize}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onLogin(e as any);
              }
            }}
          />

          {/* Remember Me and Forgot Password */}
          <Container
            direction="row"
            justify="space-between"
            align="center"
            padding="0"
            gap="8px"
            style={{ flexWrap: "wrap" }}
          >
            {showRememberMe && onRememberMeChange && (
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => onRememberMeChange(e.target.checked)}
                size={size === "small" ? "sm" : "md"}
                sx={{
                  "& .MuiCheckbox-label": {
                    fontSize: size === "small" ? "0.875rem" : "0.95rem",
                  },
                }}
              />
            )}
          </Container>
        </Container>

        {/* Login Button */}
        <Container direction="column" padding="0" gap="8px">
          <Button
            color="primary"
            onClick={onLogin}
            size={config.inputSize}
            variant="solid"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          {error && (
            <Typography.Body
              size={size === "small" ? "sm" : "sm"}
              sx={{ color: colors.error }}
            >
              {error}
            </Typography.Body>
          )}
        </Container>

        {forgotPasswordLink && (
          <Link to={forgotPasswordLink} style={{ textDecoration: "none" }}>
            <Typography.Body
              size={size === "small" ? "sm" : "normal"}
              sx={{ color: "#0077B6" }}
            >
              Forgot Password?
            </Typography.Body>
          </Link>
        )}

        {/* Sign Up Link */}
        {signUpLink && (
          <Container
            padding="0"
            gap="4px"
            justify="center"
            align="center"
            direction="row"
          >
            <Typography.Body size={size === "small" ? "sm" : "sm"}>
              {signUpPromptText}
            </Typography.Body>
            <Link to={signUpLink} style={{ textDecoration: "none" }}>
              <Typography.Body
                size={size === "small" ? "sm" : "sm"}
                sx={{ color: "#0077B6" }}
              >
                {signUpLinkText}
              </Typography.Body>
            </Link>
          </Container>
        )}

        {children}
      </Container>
    </div>
  );
};

export default LoginForm;
