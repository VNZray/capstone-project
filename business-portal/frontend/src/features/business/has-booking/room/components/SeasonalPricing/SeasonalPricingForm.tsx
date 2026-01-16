/**
 * Seasonal Pricing Form
 *
 * Main form component for configuring seasonal and weekend pricing
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  FormControl,
  Input,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import Alert from "@/src/components/Alert";
import { colors } from "@/src/utils/Colors";
import { DollarSign, Calendar, Sun, Snowflake, Leaf } from "lucide-react";
import type {
  SeasonalPricing,
  CreateSeasonalPricingRequest,
  DayOfWeek,
} from "@/src/types/SeasonalPricing";
import {
  MONTHS,
  DAYS_OF_WEEK,
  DEFAULT_WEEKEND_DAYS,
  DEFAULT_PEAK_MONTHS,
  DEFAULT_HIGH_MONTHS,
  DEFAULT_LOW_MONTHS,
  SEASON_COLORS,
} from "@/src/types/SeasonalPricing";
import {
  fetchSeasonalPricingByRoomId,
  upsertSeasonalPricing,
} from "@/src/services/SeasonalPricingService";

interface SeasonalPricingFormProps {
  businessId: string;
  roomId: string;
  defaultPrice?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SeasonalPricingForm: React.FC<SeasonalPricingFormProps> = ({
  businessId,
  roomId,
  defaultPrice = 0,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingPricing, setExistingPricing] =
    useState<SeasonalPricing | null>(null);

  // Form state
  const [basePrice, setBasePrice] = useState<number>(defaultPrice);
  const [weekendPrice, setWeekendPrice] = useState<number | null>(null);
  const [weekendDays, setWeekendDays] =
    useState<DayOfWeek[]>(DEFAULT_WEEKEND_DAYS);
  const [peakSeasonPrice, setPeakSeasonPrice] = useState<number | null>(null);
  const [peakSeasonMonths, setPeakSeasonMonths] =
    useState<number[]>(DEFAULT_PEAK_MONTHS);
  const [highSeasonPrice, setHighSeasonPrice] = useState<number | null>(null);
  const [highSeasonMonths, setHighSeasonMonths] =
    useState<number[]>(DEFAULT_HIGH_MONTHS);
  const [lowSeasonPrice, setLowSeasonPrice] = useState<number | null>(null);
  const [lowSeasonMonths, setLowSeasonMonths] =
    useState<number[]>(DEFAULT_LOW_MONTHS);

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  // Helper to safely parse array from JSON string or return as-is
  const parseArrayField = <T,>(
    field: T[] | string | null | undefined,
    defaultValue: T[]
  ): T[] => {
    if (!field) return defaultValue;
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return Array.isArray(field) ? field : defaultValue;
  };

  // Load existing pricing
  useEffect(() => {
    const loadPricing = async () => {
      try {
        setLoading(true);
        const pricing = await fetchSeasonalPricingByRoomId(roomId);
        if (pricing) {
          setExistingPricing(pricing);
          setBasePrice(pricing.base_price);
          setWeekendPrice(pricing.weekend_price);
          setWeekendDays(
            parseArrayField(pricing.weekend_days, DEFAULT_WEEKEND_DAYS)
          );
          setPeakSeasonPrice(pricing.peak_season_price);
          setPeakSeasonMonths(
            parseArrayField(pricing.peak_season_months, DEFAULT_PEAK_MONTHS)
          );
          setHighSeasonPrice(pricing.high_season_price);
          setHighSeasonMonths(
            parseArrayField(pricing.high_season_months, DEFAULT_HIGH_MONTHS)
          );
          setLowSeasonPrice(pricing.low_season_price);
          setLowSeasonMonths(
            parseArrayField(pricing.low_season_months, DEFAULT_LOW_MONTHS)
          );
        }
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

  // Toggle day selection
  const toggleDay = (day: DayOfWeek) => {
    setWeekendDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle month selection for a season
  const toggleMonth = (
    month: number,
    currentMonths: number[],
    setMonths: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    // Remove from other seasons first
    if (!currentMonths.includes(month)) {
      setPeakSeasonMonths((prev) => prev.filter((m) => m !== month));
      setHighSeasonMonths((prev) => prev.filter((m) => m !== month));
      setLowSeasonMonths((prev) => prev.filter((m) => m !== month));
    }

    setMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (basePrice <= 0) {
      setAlertConfig({
        open: true,
        type: "error",
        title: "Validation Error",
        message: "Base price must be greater than 0",
      });
      return;
    }

    try {
      setSaving(true);

      const request: CreateSeasonalPricingRequest = {
        business_id: businessId,
        room_id: roomId,
        base_price: basePrice,
        weekend_price: weekendPrice,
        weekend_days: weekendDays.length > 0 ? weekendDays : null,
        peak_season_price: peakSeasonPrice,
        peak_season_months:
          peakSeasonMonths.length > 0 ? peakSeasonMonths : null,
        high_season_price: highSeasonPrice,
        high_season_months:
          highSeasonMonths.length > 0 ? highSeasonMonths : null,
        low_season_price: lowSeasonPrice,
        low_season_months: lowSeasonMonths.length > 0 ? lowSeasonMonths : null,
        is_active: true,
      };

      await upsertSeasonalPricing(request);

      setAlertConfig({
        open: true,
        type: "success",
        title: "Success",
        message: "Seasonal pricing saved successfully",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save pricing:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to save pricing",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container elevation={2} align="center" padding="40px">
        <CircularProgress />
        <Typography.Body sx={{ mt: 2 }}>
          Loading pricing configuration...
        </Typography.Body>
      </Container>
    );
  }

  return (
    <Container elevation={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography.CardTitle>
          Seasonal Pricing Configuration
        </Typography.CardTitle>
        {existingPricing && (
          <Chip size="sm" color="success" variant="soft">
            Configured
          </Chip>
        )}
      </Box>

      {/* Base & Weekend Pricing */}
      <Grid container spacing={3}>
        {/* Base Price */}
        <Grid xs={12} md={6}>
          <Container elevation={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <DollarSign size={20} color={colors.primary} />
              <Typography.Label>Base Price (per night)</Typography.Label>
            </Box>
            <FormControl>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                startDecorator="₱"
                slotProps={{ input: { min: 0, step: 50 } }}
              />
            </FormControl>
            <Typography.Body size="sm" sx={{ color: "text.secondary", mt: 1 }}>
              Default rate when no seasonal pricing applies
            </Typography.Body>
          </Container>
        </Grid>

        {/* Weekend Price */}
        <Grid xs={12} md={6}>
          <Container elevation={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Calendar size={20} color={SEASON_COLORS.weekend} />
              <Typography.Label>Weekend Price (per night)</Typography.Label>
            </Box>
            <FormControl sx={{ mb: 2 }}>
              <Input
                type="number"
                value={weekendPrice || ""}
                onChange={(e) =>
                  setWeekendPrice(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                startDecorator="₱"
                placeholder="Optional"
                slotProps={{ input: { min: 0, step: 50 } }}
              />
            </FormControl>
            <Typography.Label size="sm" sx={{ mb: 1 }}>
              Weekend Days
            </Typography.Label>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {DAYS_OF_WEEK.map((day) => (
                <Chip
                  key={day}
                  size="sm"
                  variant={weekendDays.includes(day) ? "solid" : "outlined"}
                  color={weekendDays.includes(day) ? "primary" : "neutral"}
                  onClick={() => toggleDay(day)}
                  sx={{ cursor: "pointer" }}
                >
                  {day.slice(0, 3)}
                </Chip>
              ))}
            </Box>
          </Container>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Seasonal Pricing */}
      <Typography.CardTitle sx={{ mb: 2 }}>Seasonal Rates</Typography.CardTitle>

      <Grid container spacing={3}>
        {/* Peak Season */}
        <Grid xs={12} md={4}>
          <Container
            elevation={1}
            style={{ borderLeft: `4px solid ${SEASON_COLORS.peak}` }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Sun size={20} color={SEASON_COLORS.peak} />
              <Typography.Label>Peak Season</Typography.Label>
            </Box>
            <FormControl sx={{ mb: 2 }}>
              <Input
                type="number"
                value={peakSeasonPrice || ""}
                onChange={(e) =>
                  setPeakSeasonPrice(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                startDecorator="₱"
                placeholder="Optional"
                slotProps={{ input: { min: 0, step: 50 } }}
              />
            </FormControl>
            <Typography.Label size="sm" sx={{ mb: 1 }}>
              Months
            </Typography.Label>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {MONTHS.map((month) => (
                <Chip
                  key={month.value}
                  size="sm"
                  variant={
                    peakSeasonMonths.includes(month.value)
                      ? "solid"
                      : "outlined"
                  }
                  color={
                    peakSeasonMonths.includes(month.value)
                      ? "danger"
                      : "neutral"
                  }
                  onClick={() =>
                    toggleMonth(
                      month.value,
                      peakSeasonMonths,
                      setPeakSeasonMonths
                    )
                  }
                  sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                >
                  {month.label.slice(0, 3)}
                </Chip>
              ))}
            </Box>
          </Container>
        </Grid>

        {/* High Season */}
        <Grid xs={12} md={4}>
          <Container
            elevation={1}
            style={{ borderLeft: `4px solid ${SEASON_COLORS.high}` }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Snowflake size={20} color={SEASON_COLORS.high} />
              <Typography.Label>High Season</Typography.Label>
            </Box>
            <FormControl sx={{ mb: 2 }}>
              <Input
                type="number"
                value={highSeasonPrice || ""}
                onChange={(e) =>
                  setHighSeasonPrice(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                startDecorator="₱"
                placeholder="Optional"
                slotProps={{ input: { min: 0, step: 50 } }}
              />
            </FormControl>
            <Typography.Label size="sm" sx={{ mb: 1 }}>
              Months
            </Typography.Label>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {MONTHS.map((month) => (
                <Chip
                  key={month.value}
                  size="sm"
                  variant={
                    highSeasonMonths.includes(month.value)
                      ? "solid"
                      : "outlined"
                  }
                  color={
                    highSeasonMonths.includes(month.value)
                      ? "warning"
                      : "neutral"
                  }
                  onClick={() =>
                    toggleMonth(
                      month.value,
                      highSeasonMonths,
                      setHighSeasonMonths
                    )
                  }
                  sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                >
                  {month.label.slice(0, 3)}
                </Chip>
              ))}
            </Box>
          </Container>
        </Grid>

        {/* Low Season */}
        <Grid xs={12} md={4}>
          <Container
            elevation={1}
            style={{ borderLeft: `4px solid ${SEASON_COLORS.low}` }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Leaf size={20} color={SEASON_COLORS.low} />
              <Typography.Label>Low Season</Typography.Label>
            </Box>
            <FormControl sx={{ mb: 2 }}>
              <Input
                type="number"
                value={lowSeasonPrice || ""}
                onChange={(e) =>
                  setLowSeasonPrice(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                startDecorator="₱"
                placeholder="Optional"
                slotProps={{ input: { min: 0, step: 50 } }}
              />
            </FormControl>
            <Typography.Label size="sm" sx={{ mb: 1 }}>
              Months
            </Typography.Label>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {MONTHS.map((month) => (
                <Chip
                  key={month.value}
                  size="sm"
                  variant={
                    lowSeasonMonths.includes(month.value) ? "solid" : "outlined"
                  }
                  color={
                    lowSeasonMonths.includes(month.value)
                      ? "success"
                      : "neutral"
                  }
                  onClick={() =>
                    toggleMonth(
                      month.value,
                      lowSeasonMonths,
                      setLowSeasonMonths
                    )
                  }
                  sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                >
                  {month.label.slice(0, 3)}
                </Chip>
              ))}
            </Box>
          </Container>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {onCancel && (
          <Button variant="outlined" colorScheme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="solid"
          colorScheme="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : existingPricing
            ? "Update Pricing"
            : "Save Pricing"}
        </Button>
      </Box>

      {/* Alert */}
      <Alert
        open={alertConfig.open}
        onClose={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
        onConfirm={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </Container>
  );
};

export default SeasonalPricingForm;
