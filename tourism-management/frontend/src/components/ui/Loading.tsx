import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/joy";
import "./Loading.css";

interface LoadingProps {
  variant?: "default" | "splash";
  message?: string;
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
}

export default function Loading({
  variant = "default",
  message = "Loading...",
  title = "City Venture",
  subtitle = "Your Ultimate City Directory",
  showProgress = false,
}: LoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [showProgress]);

  if (variant === "splash") {
    return (
      <div className="loading-splash">
        <div className="loading-splash-content">
          {/* Logo Animation */}
          <div className="loading-logo-container">
            <div className="loading-logo">
              <div className="building building-left"></div>
              <div className="building building-center"></div>
              <div className="building building-right"></div>
              <div className="building-base"></div>
            </div>
          </div>

          {/* City Venture Text */}
          <div className="loading-brand">
            <Typography
              level="h1"
              sx={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                marginBottom: "clamp(0.5rem, 1vw, 0.75rem)",
                letterSpacing: "-0.02em",
                textShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              {title}
            </Typography>
            <Typography
              level="body-md"
              sx={{
                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                color: "rgba(255, 255, 255, 0.9)",
                margin: 0,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </Typography>
          </div>

          {/* Animated Dots */}
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="loading-progress-container">
              <div
                className="loading-progress-bar"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Background Animation */}
        <div className="loading-bg-animation">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>
      </div>
    );
  }

  // Default inline loading spinner
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        padding: 4,
        height: "100vh",
      }}
    >
      <CircularProgress
        size="lg"
        sx={{
          "--CircularProgress-size": "clamp(40px, 8vw, 60px)",
        }}
      />
      {message && (
        <Typography
          level="body-md"
          sx={{
            fontSize: "clamp(0.875rem, 2vw, 1rem)",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
