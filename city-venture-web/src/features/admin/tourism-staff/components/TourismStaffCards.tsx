import React from "react";
import { Stack, Chip, Box } from "@mui/joy";
import { CheckCircle, MinusCircle, ShieldCheck, ShieldAlert, Briefcase, Mail } from "lucide-react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import type { TourismStaff } from "@/src/types/TourismStaff";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

interface TourismStaffCardsProps {
  staff: TourismStaff[];
  onEdit: (s: TourismStaff) => void;
  onResetPassword: (s: TourismStaff) => void;
}

const TourismStaffCards: React.FC<TourismStaffCardsProps> = ({
  staff,
  onEdit,
  onResetPassword,
}) => {
  if (staff.length === 0) {
    return (
      <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", opacity: 0.8 }}>
        <Typography.Body size="md">No staff found</Typography.Body>
      </div>
    );
  }

  return (
    <>
      {staff.map((s) => (
        <Container
          key={s.tourism_id}
          elevation={2}
          padding="0"
          gap="0"
          hover={true}
          hoverEffect="lift"
          style={{
            margin: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Image */}
          <Box
            sx={{
              width: "100%",
              aspectRatio: "2/1",
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
              position: "relative",
            }}
          >
            <img
              src={placeholderImage}
              alt={`${s.first_name} ${s.last_name}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>

          {/* Content */}
          <Box
            sx={{
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flex: 1,
            }}
          >
            {/* Title and Subtitle */}
            <Box>
              <Typography.CardTitle
                size="sm"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {`${s.first_name} ${s.middle_name || ""} ${s.last_name}`}
              </Typography.CardTitle>
              <Typography.CardSubTitle
                size="xs"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  mt: 0.5,
                }}
              >
                {s.position || "-"}
              </Typography.CardSubTitle>
            </Box>

            {/* Details (Chips, Email, Role) */}
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Mail size={14} style={{ opacity: 0.6 }} />
                  <Typography.Body size="sm" sx={{ wordBreak: "break-all" }}>{s.email}</Typography.Body>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Briefcase size={14} style={{ opacity: 0.6 }} />
                  <Typography.Body size="sm" sx={{ opacity: 0.8 }}>
                    {s.role_name || "-"}
                  </Typography.Body>
                </Stack>
              </Stack>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                marginTop: "auto",
              }}
            >
              <Button
                variant="outlined"
                colorScheme="primary"
                onClick={() => onEdit(s)}
                size="sm"
                sx={{ flex: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                colorScheme="error"
                onClick={() => onResetPassword(s)}
                size="sm"
                sx={{ flex: 1 }}
              >
                Reset Password
              </Button>
            </Box>
          </Box>
        </Container>
      ))}
    </>
  );
};

export default TourismStaffCards;
