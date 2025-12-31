import { Box, Chip, Divider, Sheet, Stack } from "@mui/joy";
import Typography from "@/src/components/Typography";
import type { SeasonalPricing, DayOfWeek } from "@/src/types/SeasonalPricing";
import {
  MONTHS,
  DAYS_OF_WEEK,
  SEASON_COLORS,
} from "@/src/types/SeasonalPricing";

interface SeasonalPricingDisplayProps {
  pricing: SeasonalPricing | null;
}

/**
 * Displays the month-based seasonal pricing configuration for a room.
 * Shows base price, weekend pricing, and peak/high/low season pricing with their months.
 */
function SeasonalPricingDisplay({ pricing }: SeasonalPricingDisplayProps) {
  if (!pricing) {
    return (
      <Sheet
        variant="soft"
        sx={{ p: 3, borderRadius: "md", textAlign: "center" }}
      >
        <Typography.Body>
          No seasonal pricing configured for this room.
        </Typography.Body>
      </Sheet>
    );
  }

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return "Not set";
    return `₱${price.toLocaleString()}`;
  };

  // Parse JSON/array fields for weekend days (string[])
  const parseWeekendDays = (
    field: DayOfWeek[] | string | null | undefined
  ): DayOfWeek[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  // Parse JSON/array fields for months (number[])
  const parseMonthsField = (
    field: number[] | string | null | undefined
  ): number[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const weekendDays = parseWeekendDays(pricing.weekend_days);
  const peakMonths = parseMonthsField(pricing.peak_season_months);
  const highMonths = parseMonthsField(pricing.high_season_months);
  const lowMonths = parseMonthsField(pricing.low_season_months);

  return (
    <Stack spacing={3}>
      {/* Base Pricing Section */}
      <PricingSection title="Base Pricing">
        <Stack direction="row" spacing={4} flexWrap="wrap">
          <PriceItem
            label="Base Price (per night)"
            value={formatPrice(pricing.base_price)}
          />
          <PriceItem
            label="Weekend Price"
            value={formatPrice(pricing.weekend_price)}
          />
        </Stack>

        {weekendDays.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography.Label sx={{ mb: 1, display: "block" }}>
              Weekend Days:
            </Typography.Label>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {DAYS_OF_WEEK.map((day: DayOfWeek) => (
                <Chip
                  key={day}
                  size="sm"
                  variant={weekendDays.includes(day) ? "solid" : "outlined"}
                  color={weekendDays.includes(day) ? "primary" : "neutral"}
                >
                  {day}
                </Chip>
              ))}
            </Stack>
          </Box>
        )}
      </PricingSection>

      <Divider />

      {/* Peak Season */}
      <SeasonSection
        title="Peak Season"
        price={pricing.peak_season_price}
        months={peakMonths}
        color={SEASON_COLORS.peak}
        formatPrice={formatPrice}
      />

      <Divider />

      {/* High Season */}
      <SeasonSection
        title="High Season"
        price={pricing.high_season_price}
        months={highMonths}
        color={SEASON_COLORS.high}
        formatPrice={formatPrice}
      />

      <Divider />

      {/* Low Season */}
      <SeasonSection
        title="Low Season"
        price={pricing.low_season_price}
        months={lowMonths}
        color={SEASON_COLORS.low}
        formatPrice={formatPrice}
      />
    </Stack>
  );
}

interface PricingSectionProps {
  title: string;
  children: React.ReactNode;
}

function PricingSection({ title, children }: PricingSectionProps) {
  return (
    <Box>
      <Typography.CardTitle sx={{ mb: 2 }}>{title}</Typography.CardTitle>
      {children}
    </Box>
  );
}

interface PriceItemProps {
  label: string;
  value: string;
}

function PriceItem({ label, value }: PriceItemProps) {
  return (
    <Box>
      <Typography.Label sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography.Label>
      <Typography.Body sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
        {value}
      </Typography.Body>
    </Box>
  );
}

interface SeasonSectionProps {
  title: string;
  price: number | null | undefined;
  months: number[];
  color: string;
  formatPrice: (price: number | null | undefined) => string;
}

function SeasonSection({
  title,
  price,
  months,
  color,
  formatPrice,
}: SeasonSectionProps) {
  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: color }}
        />
        <Typography.CardTitle>{title}</Typography.CardTitle>
        <Typography.Body sx={{ fontWeight: "bold" }}>
          {formatPrice(price)}
        </Typography.Body>
      </Stack>

      {months.length > 0 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {MONTHS.map((month) => (
            <Chip
              key={month.value}
              size="sm"
              variant={months.includes(month.value) ? "solid" : "outlined"}
              sx={{
                ...(months.includes(month.value) && {
                  bgcolor: color,
                  color: "white",
                  "&:hover": { bgcolor: color },
                }),
              }}
            >
              {month.short}
            </Chip>
          ))}
        </Stack>
      ) : (
        <Typography.Body sx={{ color: "text.secondary", fontStyle: "italic" }}>
          No months configured for this season
        </Typography.Body>
      )}
    </Box>
  );
}

export default SeasonalPricingDisplay;
