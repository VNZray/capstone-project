import React from "react";
import { Typography, Box, Chip, Avatar, Stack } from "@mui/joy";
import { Building2, Store, Home } from "lucide-react";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";

export interface BusinessRegistration {
  id: string;
  businessName: string;
  businessType: "accommodation" | "shop";
  ownerName: string;
  email: string;
  registeredAt: string;
  status: "pending" | "approved" | "rejected";
}

interface NewRegistrationsTableProps {
  registrations: BusinessRegistration[];
  title?: string;
}

const getBusinessTypeIcon = (type: string) => {
  switch (type) {
    case "accommodation":
      return <Home size={16} />;
    case "shop":
      return <Store size={16} />;
    default:
      return <Building2 size={16} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "neutral";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const NewRegistrationsTable: React.FC<NewRegistrationsTableProps> = ({
  registrations,
  title = "Recent Business Registrations",
}) => {
  return (
    <Container elevation={2}>
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography level="title-lg" fontWeight="700" sx={{ color: "text.primary" }}>
          {title}
        </Typography>
        <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
          {registrations.length} {registrations.length === 1 ? "registration" : "registrations"}
        </Typography>
      </Box>

      <Box sx={{ height: 400, overflowY: "auto", overflowX: "hidden" }}>
        {registrations.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "background.level2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <Building2 size={28} style={{ color: colors.gray, opacity: 0.5 }} />
            </Box>
            <Typography level="body-md" fontWeight="600" sx={{ color: "text.secondary" }}>
              No registrations yet
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary", maxWidth: 280 }}>
              New business registrations will appear here
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {registrations.map((registration, index) => (
              <Box
                key={registration.id}
                sx={{
                  p: 2.5,
                  borderBottom: index < registrations.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    bgcolor: "background.level1",
                    transform: "translateX(4px)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: "primary.solidBg",
                      borderRadius: "0 4px 4px 0",
                    },
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: "primary.softBg",
                        color: "primary.solidBg",
                        transition: "all 0.2s",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {getBusinessTypeIcon(registration.businessType)}
                    </Avatar>
                    <Box>
                      <Typography level="title-sm" fontWeight="700" sx={{ mb: 0.25 }}>
                        {registration.businessName}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        {registration.ownerName} • {registration.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    size="sm"
                    color={getStatusColor(registration.status)}
                    variant="soft"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      px: 1.5,
                      borderRadius: "6px",
                      textTransform: "capitalize",
                    }}
                  >
                    {registration.status}
                  </Chip>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pt: 1,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Chip
                    size="sm"
                    variant="outlined"
                    startDecorator={getBusinessTypeIcon(registration.businessType)}
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {registration.businessType}
                  </Chip>
                  <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {formatDate(registration.registeredAt)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default NewRegistrationsTable;
