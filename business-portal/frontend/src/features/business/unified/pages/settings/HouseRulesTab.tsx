/**
 * House Rules Tab Component
 * Manages house rules like check-in/out times, guest policies, and custom rules
 */

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Sheet,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Button,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/joy";
import {
  Clock,
  Users,
  PawPrint,
  Cigarette,
  PartyPopper,
  Baby,
  UserPlus,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Alert from "@/src/components/Alert";
import type {
  BusinessPolicies,
  UpdateHouseRulesPayload,
} from "@/src/types/BusinessPolicies";
import {
  fetchBusinessPolicies,
  updateHouseRules,
} from "@/src/services/BusinessPoliciesService";
import {
  formatTimeForDisplay,
  formatTimeFor12Hour,
} from "@/src/types/BusinessPolicies";

interface HouseRulesTabProps {
  businessId: string;
}

const HouseRulesTab = ({ businessId }: HouseRulesTabProps) => {
  const [policies, setPolicies] = useState<BusinessPolicies | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ type: "info", title: "", message: "" });

  const loadPolicies = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await fetchBusinessPolicies(businessId);
      setPolicies(data);
    } catch (error) {
      console.error("Error loading policies:", error);
      setAlertConfig({
        type: "error",
        title: "Error",
        message: "Failed to load house rules",
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const handleSave = async () => {
    if (!policies) return;
    setSaving(true);
    try {
      const payload: UpdateHouseRulesPayload = {
        check_in_time: policies.check_in_time,
        check_out_time: policies.check_out_time,
        quiet_hours_start: policies.quiet_hours_start,
        quiet_hours_end: policies.quiet_hours_end,
        pets_allowed: policies.pets_allowed,
        smoking_allowed: policies.smoking_allowed,
        parties_allowed: policies.parties_allowed,
        children_allowed: policies.children_allowed,
        visitors_allowed: policies.visitors_allowed,
        max_guests_per_room: policies.max_guests_per_room,
        minimum_age_requirement: policies.minimum_age_requirement,
        additional_rules: policies.additional_rules,
      };
      const updated = await updateHouseRules(businessId, payload);
      setPolicies(updated);
      setAlertConfig({
        type: "success",
        title: "Success",
        message: "House rules saved successfully!",
      });
      setShowAlert(true);
    } catch (error) {
      console.error("Error saving house rules:", error);
      setAlertConfig({
        type: "error",
        title: "Error",
        message: "Failed to save house rules",
      });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof BusinessPolicies>(
    field: K,
    value: BusinessPolicies[K]
  ) => {
    setPolicies((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const addCustomRule = () => {
    if (!newRule.trim() || !policies) return;
    const currentRules = policies.additional_rules || [];
    updateField("additional_rules", [...currentRules, newRule.trim()]);
    setNewRule("");
  };

  const removeCustomRule = (index: number) => {
    if (!policies?.additional_rules) return;
    const newRules = policies.additional_rules.filter((_, i) => i !== index);
    updateField("additional_rules", newRules.length > 0 ? newRules : null);
  };

  if (loading) {
    return (
      <Container justify="center" align="center" style={{ padding: "2rem" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!policies) {
    return (
      <Container justify="center" align="center" style={{ padding: "2rem" }}>
        <Typography.Body>Unable to load house rules.</Typography.Body>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Alert
        open={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />

      {/* Time Rules Section */}
      <Sheet variant="outlined" sx={{ p: 3, borderRadius: "lg" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Clock size={20} />
          <Typography.CardTitle size="sm">Time Rules</Typography.CardTitle>
        </Box>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Check-in Time</FormLabel>
              <Input
                type="time"
                value={formatTimeForDisplay(policies.check_in_time)}
                onChange={(e) =>
                  updateField(
                    "check_in_time",
                    e.target.value ? `${e.target.value}:00` : null
                  )
                }
                slotProps={{
                  input: { placeholder: "14:00" },
                }}
              />
              {policies.check_in_time && (
                <Typography.Body size="xs" color="secondary">
                  {formatTimeFor12Hour(policies.check_in_time)}
                </Typography.Body>
              )}
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Check-out Time</FormLabel>
              <Input
                type="time"
                value={formatTimeForDisplay(policies.check_out_time)}
                onChange={(e) =>
                  updateField(
                    "check_out_time",
                    e.target.value ? `${e.target.value}:00` : null
                  )
                }
                slotProps={{
                  input: { placeholder: "11:00" },
                }}
              />
              {policies.check_out_time && (
                <Typography.Body size="xs" color="secondary">
                  {formatTimeFor12Hour(policies.check_out_time)}
                </Typography.Body>
              )}
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Quiet Hours Start</FormLabel>
              <Input
                type="time"
                value={formatTimeForDisplay(policies.quiet_hours_start)}
                onChange={(e) =>
                  updateField(
                    "quiet_hours_start",
                    e.target.value ? `${e.target.value}:00` : null
                  )
                }
                slotProps={{
                  input: { placeholder: "22:00" },
                }}
              />
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Quiet Hours End</FormLabel>
              <Input
                type="time"
                value={formatTimeForDisplay(policies.quiet_hours_end)}
                onChange={(e) =>
                  updateField(
                    "quiet_hours_end",
                    e.target.value ? `${e.target.value}:00` : null
                  )
                }
                slotProps={{
                  input: { placeholder: "07:00" },
                }}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Sheet>

      {/* Guest Policies Section */}
      <Sheet variant="outlined" sx={{ p: 3, borderRadius: "lg" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Users size={20} />
          <Typography.CardTitle size="sm">Guest Policies</Typography.CardTitle>
        </Box>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Maximum Guests Per Room</FormLabel>
              <Input
                type="number"
                value={policies.max_guests_per_room ?? ""}
                onChange={(e) =>
                  updateField(
                    "max_guests_per_room",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="No limit"
              />
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Minimum Age Requirement</FormLabel>
              <Input
                type="number"
                value={policies.minimum_age_requirement ?? ""}
                onChange={(e) =>
                  updateField(
                    "minimum_age_requirement",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="18"
              />
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch
                checked={policies.pets_allowed}
                onChange={(e) => updateField("pets_allowed", e.target.checked)}
              />
              <PawPrint size={18} />
              <Typography.Body>Pets Allowed</Typography.Body>
            </Box>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch
                checked={policies.smoking_allowed}
                onChange={(e) =>
                  updateField("smoking_allowed", e.target.checked)
                }
              />
              <Cigarette size={18} />
              <Typography.Body>Smoking Allowed</Typography.Body>
            </Box>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch
                checked={policies.parties_allowed}
                onChange={(e) =>
                  updateField("parties_allowed", e.target.checked)
                }
              />
              <PartyPopper size={18} />
              <Typography.Body>Parties Allowed</Typography.Body>
            </Box>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch
                checked={policies.children_allowed}
                onChange={(e) =>
                  updateField("children_allowed", e.target.checked)
                }
              />
              <Baby size={18} />
              <Typography.Body>Children Allowed</Typography.Body>
            </Box>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch
                checked={policies.visitors_allowed}
                onChange={(e) =>
                  updateField("visitors_allowed", e.target.checked)
                }
              />
              <UserPlus size={18} />
              <Typography.Body>Visitors Allowed</Typography.Body>
            </Box>
          </Grid>
        </Grid>
      </Sheet>

      {/* Additional Rules Section */}
      <Sheet variant="outlined" sx={{ p: 3, borderRadius: "lg" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography.CardTitle size="sm">
            Additional House Rules
          </Typography.CardTitle>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Input
            placeholder="Add a custom rule..."
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomRule();
              }
            }}
            sx={{ flex: 1 }}
          />
          <IconButton
            variant="solid"
            color="primary"
            onClick={addCustomRule}
            disabled={!newRule.trim()}
          >
            <Plus size={18} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {policies.additional_rules?.map((rule, index) => (
            <Chip
              key={index}
              variant="soft"
              color="primary"
              endDecorator={
                <IconButton
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={() => removeCustomRule(index)}
                >
                  <Trash2 size={14} />
                </IconButton>
              }
            >
              {rule}
            </Chip>
          ))}
          {(!policies.additional_rules ||
            policies.additional_rules.length === 0) && (
            <Typography.Body size="sm" color="secondary">
              No additional rules added yet.
            </Typography.Body>
          )}
        </Box>
      </Sheet>

      {/* Save Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="solid"
          color="primary"
          startDecorator={
            saving ? <CircularProgress size="sm" /> : <Save size={18} />
          }
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save House Rules"}
        </Button>
      </Box>
    </Box>
  );
};

export default HouseRulesTab;
