/**
 * Seasonal Pricing Display
 *
 * Read-only display of seasonal pricing configuration for RoomProfile
 */

import React, { useState, useEffect } from "react";
import { Box, Grid, Divider, CircularProgress } from "@mui/joy";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import { colors } from "@/src/utils/Colors";
import { Edit, DollarSign, Calendar, Sun, Snowflake, Leaf } from "lucide-react";
import type { SeasonalPricing } from "@/src/types/SeasonalPricing";
import { MONTHS, SEASON_COLORS } from "@/src/types/SeasonalPricing";
import { fetchSeasonalPricingByRoomId } from "@/src/services/SeasonalPricingService";

interface SeasonalPricingDisplayProps {
  roomId: string;
  defaultPrice?: number;
  onEditClick?: () => void;
}

const SeasonalPricingDisplay: React.FC<SeasonalPricingDisplayProps> = ({
  roomId,
  defaultPrice = 0,
  onEditClick,
}) => {
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<SeasonalPricing | null>(null);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        setLoading(true);
        const data = await fetchSeasonalPricingByRoomId(roomId);
        setPricing(data);
      } catch (error) {
        console.error("Failed to load pricing:", error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadPricing();
    }
  }, [roomId]);

  const formatMonths = (months: number[] | string | null): string => {
    if (!months) return "Not configured";
    // Parse JSON string if needed
    const monthsArray =
      typeof months === "string" ? JSON.parse(months) : months;
    if (!Array.isArray(monthsArray) || monthsArray.length === 0)
      return "Not configured";
    return monthsArray
      .sort((a: number, b: number) => a - b)
      .map((m: number) =>
        MONTHS.find((month) => month.value === m)?.label.slice(0, 3)
      )
      .join(", ");
  };

  // Helper to safely parse array from JSON string or return as-is
  const parseArrayField = <T,>(field: T[] | string | null): T[] => {
    if (!field) return [];
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };

  const formatPrice = (
    price: number | null | undefined,
    fallback: number
  ): string => {
    const value = price ?? fallback;
    return `₱${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Container elevation={2} align="center" padding="40px">
        <CircularProgress size="sm" />
      </Container>
    );
  }

  return (
    <Container elevation={2}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography.CardTitle>Pricing</Typography.CardTitle>
        {onEditClick && (
          <Button
            variant="outlined"
            colorScheme="secondary"
            size="sm"
            startDecorator={<Edit size={16} />}
            onClick={onEditClick}
          >
            Edit Pricing
          </Button>
        )}
      </Box>

      {/* Base & Weekend Pricing Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              bgcolor: "background.surface",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DollarSign size={16} color={colors.primary} />
              <Typography.Label size="sm" sx={{ color: "text.secondary" }}>
                Base Price
              </Typography.Label>
            </Box>
            <Typography.Title
              sx={{ fontSize: "2rem", fontWeight: 600, mb: 0.5 }}
            >
              {formatPrice(pricing?.base_price, defaultPrice)}
            </Typography.Title>
            <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
              per night
            </Typography.Body>
          </Box>
        </Grid>

        <Grid xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              bgcolor: "background.surface",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Calendar size={16} color={SEASON_COLORS.weekend} />
              <Typography.Label size="sm" sx={{ color: "text.secondary" }}>
                Weekend Price
              </Typography.Label>
            </Box>
            <Typography.Title
              sx={{ fontSize: "2rem", fontWeight: 600, mb: 0.5 }}
            >
              {pricing?.weekend_price
                ? formatPrice(pricing.weekend_price, 0)
                : "—"}
            </Typography.Title>
            <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
              {parseArrayField(pricing?.weekend_days ?? null).join(", ") ||
                "Not configured"}
            </Typography.Body>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Seasonal Pricing */}
      <Typography.CardTitle sx={{ mb: 2 }}>
        Seasonal Pricing
      </Typography.CardTitle>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Peak Season */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
            borderLeft: `4px solid ${SEASON_COLORS.peak}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Sun size={20} color={SEASON_COLORS.peak} />
            <Box>
              <Typography.Body weight="semibold">Peak Season</Typography.Body>
              <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                {formatMonths(pricing?.peak_season_months ?? null)}
              </Typography.Body>
            </Box>
          </Box>
          <Typography.Body weight="bold" sx={{ fontSize: "1.125rem" }}>
            {pricing?.peak_season_price
              ? `${formatPrice(pricing.peak_season_price, 0)}/night`
              : "—"}
          </Typography.Body>
        </Box>

        {/* High Season */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
            borderLeft: `4px solid ${SEASON_COLORS.high}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Snowflake size={20} color={SEASON_COLORS.high} />
            <Box>
              <Typography.Body weight="semibold">High Season</Typography.Body>
              <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                {formatMonths(pricing?.high_season_months ?? null)}
              </Typography.Body>
            </Box>
          </Box>
          <Typography.Body weight="bold" sx={{ fontSize: "1.125rem" }}>
            {pricing?.high_season_price
              ? `${formatPrice(pricing.high_season_price, 0)}/night`
              : "—"}
          </Typography.Body>
        </Box>

        {/* Low Season */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
            borderLeft: `4px solid ${SEASON_COLORS.low}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Leaf size={20} color={SEASON_COLORS.low} />
            <Box>
              <Typography.Body weight="semibold">Low Season</Typography.Body>
              <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                {formatMonths(pricing?.low_season_months ?? null)}
              </Typography.Body>
            </Box>
          </Box>
          <Typography.Body weight="bold" sx={{ fontSize: "1.125rem" }}>
            {pricing?.low_season_price
              ? `${formatPrice(pricing.low_season_price, 0)}/night`
              : "—"}
          </Typography.Body>
        </Box>
      </Box>

      {!pricing && (
        <Box
          sx={{ mt: 3, p: 2, bgcolor: "warning.softBg", borderRadius: "8px" }}
        >
          <Typography.Body size="sm" sx={{ color: "warning.plainColor" }}>
            No seasonal pricing configured. Click "Edit Pricing" to set up
            seasonal rates.
          </Typography.Body>
        </Box>
      )}
    </Container>
  );
};

export default SeasonalPricingDisplay;
