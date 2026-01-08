import { Box, Chip } from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { colors } from "@/src/utils/Colors";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface SubmissionCardProps {
  image: string;
  typeBadge: string;
  typeBadgeColor?: "primary" | "success" | "warning" | "danger";
  categoryBadge?: string;
  title: string;
  description: string;
  submitterName?: string;
  submittedDate?: string;
  location?: string;
  actionType?: "new" | "edit" | "delete";
  onView?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const SubmissionCard = ({
  image,
  typeBadge,
  typeBadgeColor = "primary",
  categoryBadge,
  title,
  description,
  submitterName,
  submittedDate,
  location,
  actionType,
  onView,
  onApprove,
  onReject,
}: SubmissionCardProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        padding: "clamp(1rem, 3vw, 1.25rem)",
        backgroundColor: colors.background,
        borderRadius: "12px",
        border: `1px solid #e0e0e0`,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderColor: colors.primary,
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: { xs: "100%", sm: "clamp(80px, 15vw, 120px)" },
          height: {
            xs: "clamp(150px, 40vw, 200px)",
            sm: "clamp(80px, 15vw, 120px)",
          },
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {actionType && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 1,
            }}
          >
            <Chip
              size="sm"
              variant="solid"
              color={
                actionType === "new"
                  ? "success"
                  : actionType === "delete"
                  ? "danger"
                  : "warning"
              }
              sx={{
                fontSize: "clamp(0.625rem, 1.5vw, 0.75rem)",
                fontWeight: 600,
              }}
            >
              {actionType === "new"
                ? "New"
                : actionType === "delete"
                ? "Deletion"
                : "Edit"}
            </Chip>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 0,
        }}
      >
        {/* Badges */}
        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            size="sm"
            variant="soft"
            color={typeBadgeColor}
            sx={{ fontSize: "clamp(0.625rem, 1.5vw, 0.75rem)" }}
          >
            {typeBadge}
          </Chip>
          {categoryBadge && (
            <Chip
              size="sm"
              variant="outlined"
              color="neutral"
              sx={{ fontSize: "clamp(0.625rem, 1.5vw, 0.75rem)" }}
            >
              {categoryBadge}
            </Chip>
          )}
        </Box>

        {/* Title and Description */}
        <Box>
          <Typography.CardTitle size="sm" sx={{ marginBottom: "4px" }}>
            {title}
          </Typography.CardTitle>
          <Typography.Body
            size="xs"
            color="default"
            sx={{
              opacity: 0.7,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {description}
          </Typography.Body>
        </Box>

        {/* Metadata */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1, sm: 2 },
            marginTop: "auto",
          }}
        >
          {submitterName && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonIcon
                sx={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", opacity: 0.6 }}
              />
              <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
                {submitterName}
              </Typography.Body>
            </Box>
          )}
          {submittedDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon
                sx={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", opacity: 0.6 }}
              />
              <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
                {submittedDate}
              </Typography.Body>
            </Box>
          )}
          {location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOnIcon
                sx={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", opacity: 0.6 }}
              />
              <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
                {location}
              </Typography.Body>
            </Box>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          gap: 1,
          alignItems: "center",
          justifyContent: { xs: "stretch", sm: "flex-start" },
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        {onView && (
          <Button
            size="sm"
            variant="soft"
            colorScheme="primary"
            onClick={onView}
            sx={{
              minWidth: { xs: "auto", sm: "100px" },
              flex: { xs: 1, sm: "unset" },
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
            }}
            startDecorator={<VisibilityIcon sx={{ fontSize: "1rem" }} />}
          >
            Review
          </Button>
        )}
        {onApprove && (
          <Button
            size="sm"
            variant="solid"
            colorScheme="success"
            onClick={onApprove}
            sx={{
              minWidth: { xs: "auto", sm: "50px" },
              flex: { xs: 1, sm: "unset" },
              padding: { xs: "6px 12px", sm: "6px 8px" },
            }}
            startDecorator={<CheckCircleIcon sx={{ fontSize: "1rem" }} />}
          >
            <Typography.Body>Approve</Typography.Body>
          </Button>
        )}
        {onReject && (
          <Button
            size="sm"
            variant="solid"
            colorScheme="error"
            onClick={onReject}
            sx={{
              minWidth: { xs: "auto", sm: "50px" },
              flex: { xs: 1, sm: "unset" },
              padding: { xs: "6px 12px", sm: "6px 8px" },
            }}
            startDecorator={<CancelIcon sx={{ fontSize: "1rem" }} />}
          >
            <Typography.Body>Reject</Typography.Body>
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SubmissionCard;
