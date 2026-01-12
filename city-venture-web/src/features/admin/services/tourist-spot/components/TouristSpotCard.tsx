import {
  Box,
  Chip,
  Stack,
  AspectRatio,
  Dropdown,
  Menu,
  MenuItem,
  MenuButton,
  ListItemDecorator,
} from "@mui/joy";
import { MoreVert } from "@mui/icons-material";
import { Star, Eye, Edit, Trash2, MessageSquare } from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import type { TouristSpot } from "@/src/types/TouristSpot";

interface TouristSpotCardProps {
  spot: TouristSpot;
  imageUrl: string;
  addressLine: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewReviews: () => void;
}

const TouristSpotCard = ({
  spot,
  imageUrl,
  addressLine,
  onView,
  onEdit,
  onDelete,
  onViewReviews,
}: TouristSpotCardProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "12px",
        overflow: "visible",
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Image Container */}
      <AspectRatio
        ratio="16/9"
        sx={{
          backgroundColor: "#f0f0f0",
          borderRadius: "12px 12px 0 0",
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          alt={spot.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Status Badge - Top Left */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 2,
          }}
        >
          <Chip
            size="sm"
            color={spot.spot_status === "active" ? "success" : "neutral"}
            variant="solid"
          >
            {spot.spot_status}
          </Chip>

          {spot.is_featured && (
            <Chip
              size="sm"
              color="warning"
              variant="solid"
              startDecorator={<Star size={12} fill="white" />}
            >
              Featured
            </Chip>
          )}
        </Stack>

        {/* More Options - Top Right */}
        <Box
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            zIndex: 2,
          }}
        >
          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: {
                  variant: "solid",
                  size: "sm",
                  colorScheme: "black",
                  sx: {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                    },
                  },
                } as any,
              }}
            >
              <MoreVert sx={{ color: "#333" }} />
            </MenuButton>
            <Menu
              placement="bottom-end"
              modifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [0, 4],
                  },
                },
              ]}
              sx={{
                zIndex: 1300,
              }}
            >
              <MenuItem onClick={onView}>
                <ListItemDecorator>
                  <Eye size={18} />
                </ListItemDecorator>
                View Details
              </MenuItem>
              <MenuItem onClick={onEdit}>
                <ListItemDecorator>
                  <Edit size={18} />
                </ListItemDecorator>
                Edit
              </MenuItem>
              <MenuItem onClick={onViewReviews}>
                <ListItemDecorator>
                  <MessageSquare size={18} />
                </ListItemDecorator>
                Reviews
              </MenuItem>
              <MenuItem onClick={onDelete} color="danger">
                <ListItemDecorator>
                  <Trash2 size={18} />
                </ListItemDecorator>
                Delete
              </MenuItem>
            </Menu>
          </Dropdown>
        </Box>

        {/* Views and Rating - Bottom of Image */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            right: "12px",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          {/* Views Count */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            <Eye size={14} color="white" />
            <Typography.Body size="xs" sx={{ color: "white", fontWeight: 500 }}>
              {spot.views || 0} views
            </Typography.Body>
          </Stack>

          {/* Rating */}
          {spot.average_rating && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              <Star size={14} fill="#FFD700" color="#FFD700" />
              <Typography.Body
                size="xs"
                sx={{ color: "white", fontWeight: 500 }}
              >
                {Number(spot.average_rating).toFixed(1)}
              </Typography.Body>
            </Stack>
          )}
        </Stack>
      </AspectRatio>

      {/* Card Content */}
      <Box sx={{ p: 2 }}>
        {/* Title */}
        <Typography.CardTitle
          size="sm"
          sx={{
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {spot.name}
        </Typography.CardTitle>

        {/* Subtitle with Location Icon */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mb: 1.5, alignItems: "center" }}
        >
          <Box
            component="svg"
            sx={{ width: 14, height: 14, color: "#666", flexShrink: 0 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </Box>
          <Typography.CardSubTitle
            size="xs"
            sx={{
              color: "#666",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {addressLine}
          </Typography.CardSubTitle>
        </Stack>

        {/* Category Chips */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            flexWrap: "wrap",
            mb: 2,
            minHeight: "28px",
          }}
        >
          {Array.isArray(spot.categories) &&
            spot.categories.slice(0, 2).map((cat, idx) => (
              <Chip key={idx} size="sm" variant="soft" color="primary">
                {cat.category_title || String(cat)}
              </Chip>
            ))}
          {spot.categories && spot.categories.length > 2 && (
            <Chip size="sm" variant="soft" color="neutral">
              +{spot.categories.length - 2}
            </Chip>
          )}
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="solid"
            colorScheme="primary"
            size="sm"
            onClick={onView}
            startDecorator={<Eye size={16} />}
            sx={{ flex: 1 }}
          >
            View
          </Button>
          <IconButton
            variant="outlined"
            colorScheme="primary"
            size="sm"
            onClick={onEdit}
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            variant="outlined"
            colorScheme="error"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default TouristSpotCard;
