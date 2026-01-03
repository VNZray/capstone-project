import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { Box, Typography, Stack, Button as JoyButton, Card } from "@mui/joy";
import { ShieldX, Home, ArrowLeft, LogOut } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    const staffRoles = ["Manager", "Room Manager", "Receptionist", "Sales Associate"];
    const userRole = user?.role_name || "";
    const roleType = user?.role_type;
    const isCustomBusinessRole = roleType === 'business';
    const isStaff = isCustomBusinessRole || staffRoles.includes(userRole);
    
    if (userRole === "Business Owner") {
      navigate("/business");
    } else if (isStaff) {
      // Staff and custom business roles go to dashboard
      navigate("/business/dashboard");
    } else if (userRole === "Admin" || userRole === "Tourism Officer") {
      navigate("/tourism/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.body",
        px: 2,
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 500, textAlign: "center" }}>
        {/* Icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: "background.level1",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              bgcolor: "danger.softBg",
              opacity: 0.15,
              animation: "pulse 2s ease-in-out infinite",
            },
            "@keyframes pulse": {
              "0%, 100%": {
                transform: "scale(1)",
                opacity: 0.1,
              },
              "50%": {
                transform: "scale(1.1)",
                opacity: 0.2,
              },
            },
          }}
        >
          <ShieldX size={80} strokeWidth={1.5} style={{ opacity: 0.4, color: "#C41E3A" }} />
        </Box>

        {/* Error Code */}
        <Typography
          level="h1"
          sx={{
            fontSize: { xs: "4rem", sm: "5rem" },
            fontWeight: 800,
            color: "danger.solidBg",
            lineHeight: 1,
            opacity: 0.9,
          }}
        >
          403
        </Typography>

        {/* Title */}
        <Typography
          level="h3"
          fontWeight="600"
          sx={{ color: "text.primary", mb: 0.5 }}
        >
          Access Denied
        </Typography>

        {/* Message */}
        <Typography
          level="body-md"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          You don't have permission to access this page. This area is restricted
          to authorized users with specific roles or permissions.
        </Typography>

        {/* User Info Card */}
        {user && (
          <Card
            variant="soft"
            color="primary"
            sx={{
              width: "100%",
              maxWidth: 350,
              mt: 1,
            }}
          >
            <Stack spacing={0.5}>
              <Typography level="body-sm" fontWeight="600" sx={{ color: "primary.solidBg" }}>
                Current Account
              </Typography>
              <Typography level="body-sm" sx={{ color: "text.primary" }}>
                {user.email}
              </Typography>
              <Typography level="body-xs" sx={{ color: "text.secondary", opacity: 0.8 }}>
                Role: {user.role_name || "User"}
              </Typography>
            </Stack>
          </Card>
        )}

        {/* Actions */}
        <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 350, mt: 2 }}>
          <JoyButton
            size="lg"
            color="primary"
            variant="solid"
            startDecorator={<Home size={18} />}
            onClick={handleGoHome}
            fullWidth
          >
            Go to Home
          </JoyButton>

          <JoyButton
            size="lg"
            color="neutral"
            variant="outlined"
            startDecorator={<ArrowLeft size={18} />}
            onClick={handleGoBack}
            fullWidth
          >
            Go Back
          </JoyButton>

          {user && (
            <JoyButton
              size="md"
              color="neutral"
              variant="plain"
              startDecorator={<LogOut size={16} />}
              onClick={handleLogout}
              fullWidth
              sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
            >
              Logout and switch account
            </JoyButton>
          )}
        </Stack>

        {/* Help Text */}
        <Typography
          level="body-xs"
          sx={{ color: "text.tertiary", mt: 2, opacity: 0.7 }}
        >
          If you believe this is an error, please contact your administrator or
          try logging in with a different account.
        </Typography>
      </Stack>
    </Box>
  );
}
