import * as React from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer"; // promo type / code
import DiscountIcon from "@mui/icons-material/Discount"; // discount marker (available in MUI v5 icons set)
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Divider, LinearProgress } from "@mui/joy";
import Container from "@/src/components/Container";

// Status types (can be expanded)
export type PromoStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "PAUSED";

export interface PromoCardProps {
  id: string;
  image?: string;
  title: string;
  description: string;
  startDate: string; // ISO
  endDate: string; // ISO
  promoCode?: string; // for CODE type or vouchers
  promoType: "DISCOUNT" | "CODE" | "BOGO" | "FREE_TRIAL"; // flexible
  discountValue?: number; // percentage if DISCOUNT
  status: PromoStatus;
  // NEW: usage limiting (either code redemptions or discount applications)
  usageLimit?: number; // total allowed uses
  usedCount?: number; // how many times already used
  appliesToAll?: boolean; // scope indicator
  roomCount?: number; // number of specific rooms selected when not all
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, nextStatus: PromoStatus) => void; // for pause/resume
  onClick?: (id: string) => void; // open details
  elevation?: any; // allow custom override if parent wraps w/ Joy theme tokens
}

const statusChipColor: Record<PromoStatus, any> = {
  ACTIVE: "success",
  SCHEDULED: "neutral",
  EXPIRED: "danger",
  PAUSED: "warning",
};

const statusLabel: Record<PromoStatus, string> = {
  ACTIVE: "Active",
  SCHEDULED: "Scheduled",
  EXPIRED: "Expired",
  PAUSED: "Paused",
};

const typeLabel: Record<PromoCardProps["promoType"], string> = {
  DISCOUNT: "Discount",
  CODE: "Promo Code",
  BOGO: "BOGO",
  FREE_TRIAL: "Free Trial",
};

const PromoCard: React.FC<PromoCardProps> = ({
  id,
  image,
  title,
  description,
  startDate,
  endDate,
  promoCode,
  promoType,
  discountValue,
  status: initialStatus,
  usageLimit,
  usedCount = 0,
  appliesToAll,
  roomCount,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
}) => {
  const [status, setStatus] = React.useState<PromoStatus>(initialStatus);
  const [copied, setCopied] = React.useState(false);

  const safeLimit = usageLimit && usageLimit > 0 ? usageLimit : undefined;
  const clampedUsed = safeLimit ? Math.min(usedCount, safeLimit) : usedCount;
  const usagePct = safeLimit ? Math.round((clampedUsed / safeLimit) * 100) : 0;
  const depleted = safeLimit ? clampedUsed >= safeLimit : false;

  React.useEffect(() => setStatus(initialStatus), [initialStatus]);

  const handlePauseToggle = () => {
    let next: PromoStatus;
    if (status === "PAUSED") next = "ACTIVE";
    else if (status === "ACTIVE") next = "PAUSED";
    else next = status; // only toggle between Active & Paused
    if (status === "SCHEDULED") return; // ignore toggle until started
    if (status === "EXPIRED") return; // cannot resume expired
    setStatus(next);
    onStatusChange?.(id, next);
  };

  const handleCopy = () => {
    if (!promoCode) return;
    try {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.warn("Clipboard copy failed", e);
    }
  };

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange = `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  const isOngoing = now >= start && now <= end;
  const isExpired = now > end;

  // Auto mark expired if time passed (client-side only, server would handle real logic)
  React.useEffect(() => {
    if (isExpired && status !== "EXPIRED") {
      setStatus("EXPIRED");
      onStatusChange?.(id, "EXPIRED");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  return (
    <Container
      elevation={2}
      hoverEffect="lift"
      hoverDuration={300}
      hover
    >
      {/* IMAGE + STATUS & TYPE CHIPS */}
      <Box
        sx={{ position: "relative", cursor: onClick ? "pointer" : "default" }}
        onClick={() => onClick?.(id)}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 260,
              aspectRatio: "16/9",
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 200,
              bgcolor: "neutral.softBg",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "neutral.plainColor",
              fontSize: 14,
            }}
          >
            No Image
          </Box>
        )}

        <Chip
          color={statusChipColor[status] as any}
          variant="solid"
          size="md"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            textTransform: "capitalize",
          }}
        >
          {statusLabel[status]}
        </Chip>

        {appliesToAll !== undefined && (
          <Chip
            color="neutral"
            variant="soft"
            size="sm"
            sx={{ position: "absolute", bottom: 12, left: 12 }}
          >
            {appliesToAll
              ? "All Rooms"
              : roomCount && roomCount > 0
              ? `${roomCount} Room${roomCount === 1 ? "" : "s"}`
              : "No Rooms"}
          </Chip>
        )}

        <Chip
          color="primary"
          variant="soft"
          size="md"
          startDecorator={
            promoType === "DISCOUNT" ? (
              <DiscountIcon fontSize="small" />
            ) : (
              <LocalOfferIcon fontSize="small" />
            )
          }
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          {typeLabel[promoType]}
        </Chip>
      </Box>

      <CardContent sx={{ pb: 1 }}>
        <Typography
          level="h4"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {title}
          {promoType === "DISCOUNT" && typeof discountValue === "number" && (
            <Chip color="warning" variant="soft" size="sm">
              {discountValue}% OFF
            </Chip>
          )}
        </Typography>
        <Typography
          level="body-sm"
          sx={{
            mt: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </Typography>

        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography level="body-xs" color="neutral">
            {dateRange}
          </Typography>
          <Typography
            level="body-xs"
            color={isOngoing ? "success" : isExpired ? "danger" : "neutral"}
          >
            {isOngoing
              ? "Ongoing"
              : isExpired
              ? "Ended"
              : `Starts ${start.toLocaleDateString()}`}
          </Typography>
        </Box>

        {/* Usage limit display */}
        {safeLimit !== undefined && (
          <Box
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography level="body-xs" color="neutral">
                Uses: {clampedUsed} / {safeLimit}
              </Typography>
              {depleted && (
                <Chip size="sm" color="danger" variant="soft">
                  Depleted
                </Chip>
              )}
            </Box>
            <LinearProgress
              determinate
              value={usagePct}
              color={
                depleted ? "danger" : usagePct > 80 ? "warning" : "primary"
              }
              sx={{ height: 6, borderRadius: 8 }}
              aria-label="Promo usage"
            />
          </Box>
        )}

        {promoCode && (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              size="sm"
              variant="outlined"
              color="neutral"
              startDecorator={<LocalOfferIcon fontSize="small" />}
            >
              {promoCode}
            </Chip>
            <Tooltip title={copied ? "Copied" : "Copy Code"} variant="soft">
              <IconButton
                size="sm"
                variant="soft"
                color={copied ? "success" : "neutral"}
                onClick={handleCopy}
                aria-label="Copy promo code"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>

      <Divider />
      <CardActions
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          onClick={handlePauseToggle}
          variant="solid"
          color={status === "PAUSED" ? "success" : "warning"}
          aria-label={
            status === "PAUSED"
              ? `Resume promotion ${title}`
              : `Pause promotion ${title}`
          }
          disabled={status === "SCHEDULED" || status === "EXPIRED"}
        >
          {status === "PAUSED" ? "Resume" : "Pause"}
        </Button>
        <IconButton
          onClick={() => onEdit?.(id)}
          sx={{ borderRadius: 2 }}
          color="primary"
          variant="solid"
          aria-label={`Edit promotion ${title}`}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => onDelete?.(id)}
          sx={{ borderRadius: 2 }}
          color="danger"
          variant="solid"
          aria-label={`Delete promotion ${title}`}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Container>
  );
};

export default PromoCard;
