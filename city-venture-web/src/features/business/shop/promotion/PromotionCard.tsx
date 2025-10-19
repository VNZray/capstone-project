import React from "react";
import {
  Card,
  Stack,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  AspectRatio,
  type ChipPropsColorOverrides,
} from "@mui/joy";
import type { OverridableStringUnion } from "@mui/types";
import {
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiImage,
} from "react-icons/fi";
import type { Promotion } from "@/src/types/Promotion";
import type { ColorPaletteProp } from "@mui/joy/styles";

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
  getStatusColor: (status: string) => OverridableStringUnion<ColorPaletteProp, ChipPropsColorOverrides>;
  getStatusIcon: (status: string) => React.ReactNode;
  getEffectiveStatus: (promotion: Promotion) => string;
  formatDateTime: (dateString: string) => string;
}

export default function PromotionCard({
  promotion,
  onEdit,
  onDelete,
  getStatusColor,
  getStatusIcon,
  getEffectiveStatus,
  formatDateTime,
}: PromotionCardProps): React.ReactElement {
  const status = getEffectiveStatus(promotion);

  const truncate = (value: string, max = 40) => {
    if (!value) return "";
    return value.length > max ? `${value.slice(0, max - 3)}...` : value;
  };


  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "md",
          borderColor: "primary.outlinedBorder",
        },
      }}
    >
      {/* Image Section */}
      {promotion.image_url ? (
        <AspectRatio ratio="16/9" sx={{ overflow: "hidden" }}>
          <Box
            component="img"
            src={promotion.image_url}
            alt={promotion.title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            sx={{
              objectFit: "cover",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </AspectRatio>
      ) : (
        <AspectRatio
          ratio="16/9"
          sx={{
            bgcolor: "background.level2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <FiImage size={32} style={{ opacity: 0.5 }} />
            <Typography level="body-sm" textColor="text.tertiary">
              No image
            </Typography>
          </Box>
        </AspectRatio>
      )}

      {/* Content Section */}
      <Stack spacing={1.5} sx={{ flex: 1, p: 1.5 }}>
        {/* Status Badge */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 1 }}>
          <Chip
            variant="soft"
            color={getStatusColor(status)}
            startDecorator={getStatusIcon(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Chip>
        </Box>

        {/* Title */}
        <Typography
          level="title-md"
          fontWeight="bold"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {promotion.title}
        </Typography>

        {/* Description */}
        {promotion.description && (
          <Typography
            level="body-sm"
            textColor="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {promotion.description}
          </Typography>
        )}

        {/* Media Chips */}
        {(promotion.image_url || promotion.external_link) && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {/** image chip removed per request */}

            {promotion.external_link && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <a
                  href={promotion.external_link}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Open external link for promotion ${promotion.title}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Chip
                    variant="plain"
                    color="primary"
                    size="sm"
                    startDecorator={<FiExternalLink />}
                    sx={{ maxWidth: 300, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  >
                    {truncate(promotion.external_link, 40)}
                  </Chip>
                </a>
              </Box>
            )}
          </Stack>
        )}

        {/* Date Information */}
        <Stack spacing={0.5} sx={{ mt: "auto", pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
          <Box>
            <Typography level="body-xs" fontWeight="600" textColor="text.secondary">
              Starts:
            </Typography>
            <Typography level="body-xs">{formatDateTime(promotion.start_date)}</Typography>
          </Box>
          {promotion.end_date ? (
            <Box>
              <Typography level="body-xs" fontWeight="600" textColor="text.secondary">
                Ends:
              </Typography>
              <Typography level="body-xs">{formatDateTime(promotion.end_date)}</Typography>
            </Box>
          ) : (
            <Typography level="body-xs" textColor="text.tertiary" fontStyle="italic">
              No end date
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Action Buttons */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          justifyContent: "flex-end",
        }}
      >
        <Tooltip title="Edit promotion">
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => onEdit(promotion)}
          >
            <FiEdit2 />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete promotion">
          <IconButton
            size="sm"
            variant="outlined"
            color="danger"
            onClick={() => onDelete(promotion)}
          >
            <FiTrash2 />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}
