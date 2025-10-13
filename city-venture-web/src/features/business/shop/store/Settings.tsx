import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Stack,
  Switch,
  Typography,
} from "@mui/joy";
import { FiRefreshCw, FiSave } from "react-icons/fi";

import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  fetchBusinessSettings,
  upsertBusinessSettings,
} from "@/src/services/BusinessSettingsService";
import type { BusinessSettings } from "@/src/types/BusinessSettings";
import { defaultBusinessSettings } from "@/src/types/BusinessSettings";

type NumericSettingKey =
  | "minimum_preparation_time_minutes"
  | "order_advance_notice_hours"
  | "cancellation_deadline_hours"
  | "cancellation_penalty_percentage"
  | "cancellation_penalty_fixed"
  | "service_booking_advance_notice_hours"
  | "service_default_duration_minutes";

type BooleanSettingKey =
  | "accepts_product_orders"
  | "accepts_service_bookings"
  | "allow_customer_cancellation"
  | "auto_confirm_orders"
  | "auto_confirm_bookings"
  | "send_notifications";

const numberParsingMap: Record<NumericSettingKey, (value: string) => number | null> = {
  minimum_preparation_time_minutes: (value) => parseInt(value, 10) || 0,
  order_advance_notice_hours: (value) => parseInt(value, 10) || 0,
  cancellation_deadline_hours: (value) => {
    if (value === "") return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  },
  cancellation_penalty_percentage: (value) => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), 100);
  },
  cancellation_penalty_fixed: (value) => {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
  },
  service_booking_advance_notice_hours: (value) => parseInt(value, 10) || 0,
  service_default_duration_minutes: (value) => parseInt(value, 10) || 0,
};

export default function Settings(): React.ReactElement {
  const { businessDetails } = useBusiness();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const businessId = businessDetails?.id ?? "";
  const hasBusinessSelected = Boolean(businessId);

  const isDirty = useMemo(() => {
    if (!settings || !initialSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [initialSettings, settings]);

  const loadSettings = useCallback(async () => {
    if (!hasBusinessSelected) {
      setSettings(null);
      setInitialSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchBusinessSettings(businessId);
      setSettings(data);
      setInitialSettings(data);
    } catch (err) {
      console.error("Failed to fetch business settings", err);
      setError("Unable to load store settings. Please try again.");
      setSettings({ ...defaultBusinessSettings, business_id: businessId });
      setInitialSettings({ ...defaultBusinessSettings, business_id: businessId });
    } finally {
      setLoading(false);
    }
  }, [businessId, hasBusinessSelected]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateNumericSetting = (key: NumericSettingKey, value: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const parsed = numberParsingMap[key](value);
      return {
        ...prev,
        [key]: parsed,
      } as BusinessSettings;
    });
  };

  const updateBooleanSetting = (key: BooleanSettingKey, value: boolean) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleSave = async () => {
    if (!settings || !hasBusinessSelected) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        minimum_preparation_time_minutes,
        order_advance_notice_hours,
        accepts_product_orders,
        accepts_service_bookings,
        cancellation_deadline_hours,
        cancellation_penalty_percentage,
        cancellation_penalty_fixed,
        allow_customer_cancellation,
        service_booking_advance_notice_hours,
        service_default_duration_minutes,
        auto_confirm_orders,
        auto_confirm_bookings,
        send_notifications,
      } = settings;

      const payload = {
        minimum_preparation_time_minutes,
        order_advance_notice_hours,
        accepts_product_orders,
        accepts_service_bookings,
        cancellation_deadline_hours,
        cancellation_penalty_percentage,
        cancellation_penalty_fixed,
        allow_customer_cancellation,
        service_booking_advance_notice_hours,
        service_default_duration_minutes,
        auto_confirm_orders,
        auto_confirm_bookings,
        send_notifications,
      };

      const response = await upsertBusinessSettings(businessId, payload);
      setSettings(response);
      setInitialSettings(response);
      setSuccess("Store settings updated successfully.");
    } catch (err) {
      console.error("Failed to save business settings", err);
      setError("Failed to save settings. Please review your inputs and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setSuccess(null);
    setError(null);
  };

  if (!hasBusinessSelected) {
    return (
      <PageContainer>
        <Alert
          color="warning"
          variant="soft"
          sx={{ maxWidth: 640 }}
        >
          Please select a business to manage store settings.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography level="h2" fontWeight="lg">
              Store Settings
            </Typography>
            <Typography level="body-md" textColor="text.secondary">
              Configure order handling, cancellations, and automation rules for your store.
            </Typography>
            {settings?.updated_at && (
              <Typography level="body-sm" textColor="text.tertiary" sx={{ mt: 0.5 }}>
                Last updated: {new Date(settings.updated_at).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startDecorator={<FiRefreshCw />}
              disabled={!isDirty || saving}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              color="primary"
              startDecorator={<FiSave />}
              loading={saving}
              disabled={!isDirty || saving}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert color="danger" variant="soft">
            {error}
          </Alert>
        )}
        {success && (
          <Alert color="success" variant="soft">
            {success}
          </Alert>
        )}

        {loading || !settings ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size="lg" />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography level="title-lg">Order & Product Handling</Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Minimum Preparation Time (minutes)</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        value={settings.minimum_preparation_time_minutes}
                        onChange={(event) => updateNumericSetting("minimum_preparation_time_minutes", event.target.value)}
                      />
                      <FormHelperText>
                        Buffer time before an order can be fulfilled.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Advance Notice for Orders (hours)</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        value={settings.order_advance_notice_hours}
                        onChange={(event) => updateNumericSetting("order_advance_notice_hours", event.target.value)}
                      />
                      <FormHelperText>
                        Require customers to place orders this many hours in advance.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
                <Divider />
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                  <Switch
                    checked={settings.accepts_product_orders}
                    onChange={(event) => updateBooleanSetting("accepts_product_orders", event.target.checked)}
                    endDecorator="Accept product orders"
                  />
                  <Switch
                    checked={settings.accepts_service_bookings}
                    onChange={(event) => updateBooleanSetting("accepts_service_bookings", event.target.checked)}
                    endDecorator="Accept service bookings"
                  />
                </Stack>
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography level="title-lg">Cancellation Policy</Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={4}>
                    <FormControl>
                      <FormLabel>Cancellation Deadline (hours)</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        placeholder="No deadline"
                        value={settings.cancellation_deadline_hours ?? ""}
                        onChange={(event) => updateNumericSetting("cancellation_deadline_hours", event.target.value)}
                      />
                      <FormHelperText>
                        Customers must cancel before this deadline. Leave empty for no limit.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl>
                      <FormLabel>Penalty Percentage (%)</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={settings.cancellation_penalty_percentage}
                        onChange={(event) => updateNumericSetting("cancellation_penalty_percentage", event.target.value)}
                      />
                      <FormHelperText>
                        Percentage deducted from refunds when cancelled late.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl>
                      <FormLabel>Penalty Fixed Amount</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.cancellation_penalty_fixed}
                        onChange={(event) => updateNumericSetting("cancellation_penalty_fixed", event.target.value)}
                      />
                      <FormHelperText>
                        Additional fixed fee applied to late cancellations.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
                <Switch
                  checked={settings.allow_customer_cancellation}
                  onChange={(event) => updateBooleanSetting("allow_customer_cancellation", event.target.checked)}
                  endDecorator="Allow customers to cancel their orders/bookings"
                />
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography level="title-lg">Service Booking Settings</Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Advance Notice for Bookings (hours)</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        value={settings.service_booking_advance_notice_hours}
                        onChange={(event) => updateNumericSetting("service_booking_advance_notice_hours", event.target.value)}
                      />
                      <FormHelperText>
                        Minimum hours before a service booking can start.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Default Service Duration (minutes)</FormLabel>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        value={settings.service_default_duration_minutes}
                        onChange={(event) => updateNumericSetting("service_default_duration_minutes", event.target.value)}
                      />
                      <FormHelperText>
                        Used when a service does not specify its own duration.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography level="title-lg">Automation & Notifications</Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                  <Switch
                    checked={settings.auto_confirm_orders}
                    onChange={(event) => updateBooleanSetting("auto_confirm_orders", event.target.checked)}
                    endDecorator="Automatically confirm new orders"
                  />
                  <Switch
                    checked={settings.auto_confirm_bookings}
                    onChange={(event) => updateBooleanSetting("auto_confirm_bookings", event.target.checked)}
                    endDecorator="Automatically confirm new bookings"
                  />
                  <Switch
                    checked={settings.send_notifications}
                    onChange={(event) => updateBooleanSetting("send_notifications", event.target.checked)}
                    endDecorator="Send real-time alerts to staff"
                  />
                </Stack>
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>
    </PageContainer>
  );
}
