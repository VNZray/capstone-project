/**
 * Policy Texts Tab Component
 * Manages written policies like cancellation, refund, payment policies, etc.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Sheet,
  Textarea,
  Button,
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  CircularProgress,
} from "@mui/joy";
import {
  FileText,
  Ban,
  RefreshCcw,
  CreditCard,
  Shield,
  PawPrint,
  Cigarette,
  Save,
  ChevronDown,
} from "lucide-react";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Alert from "@/src/components/Alert";
import type {
  BusinessPolicies,
  UpdatePolicyTextsPayload,
} from "@/src/types/BusinessPolicies";
import {
  fetchBusinessPolicies,
  updatePolicyTexts,
} from "@/src/services/BusinessPoliciesService";

interface PolicyTextsTabProps {
  businessId: string;
}

interface PolicyField {
  key: keyof UpdatePolicyTextsPayload;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  description: string;
}

const policyFields: PolicyField[] = [
  {
    key: "cancellation_policy",
    label: "Cancellation Policy",
    icon: <Ban size={18} />,
    placeholder: "Describe your cancellation terms...",
    description:
      "Outline the conditions under which guests can cancel their booking and any applicable fees.",
  },
  {
    key: "refund_policy",
    label: "Refund Policy",
    icon: <RefreshCcw size={18} />,
    placeholder: "Describe your refund terms...",
    description:
      "Explain how and when guests can receive refunds for their bookings or purchases.",
  },
  {
    key: "payment_policy",
    label: "Payment Policy",
    icon: <CreditCard size={18} />,
    placeholder: "Describe your payment terms...",
    description:
      "Detail accepted payment methods, timing, and any deposit requirements.",
  },
  {
    key: "damage_policy",
    label: "Damage & Security Deposit Policy",
    icon: <Shield size={18} />,
    placeholder: "Describe your damage and security deposit terms...",
    description:
      "Explain policies regarding property damage, security deposits, and liability.",
  },
  {
    key: "pet_policy",
    label: "Pet Policy",
    icon: <PawPrint size={18} />,
    placeholder: "Describe your pet policy in detail...",
    description:
      "Provide detailed information about pet rules, fees, and restrictions if applicable.",
  },
  {
    key: "smoking_policy",
    label: "Smoking Policy",
    icon: <Cigarette size={18} />,
    placeholder: "Describe your smoking policy...",
    description:
      "Specify where smoking is allowed or prohibited and any applicable fees for violations.",
  },
];

const PolicyTextsTab = ({ businessId }: PolicyTextsTabProps) => {
  const [policies, setPolicies] = useState<BusinessPolicies | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedPolicies, setExpandedPolicies] = useState<string[]>([
    "cancellation_policy",
  ]);
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
        message: "Failed to load policies",
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
      const payload: UpdatePolicyTextsPayload = {
        cancellation_policy: policies.cancellation_policy,
        refund_policy: policies.refund_policy,
        payment_policy: policies.payment_policy,
        damage_policy: policies.damage_policy,
        pet_policy: policies.pet_policy,
        smoking_policy: policies.smoking_policy,
      };
      const updated = await updatePolicyTexts(businessId, payload);
      setPolicies(updated);
      setAlertConfig({
        type: "success",
        title: "Success",
        message: "Policies saved successfully!",
      });
      setShowAlert(true);
    } catch (error) {
      console.error("Error saving policies:", error);
      setAlertConfig({
        type: "error",
        title: "Error",
        message: "Failed to save policies",
      });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (
    field: keyof UpdatePolicyTextsPayload,
    value: string | null
  ) => {
    setPolicies((prev) => (prev ? { ...prev, [field]: value || null } : null));
  };

  const toggleAccordion = (key: string) => {
    setExpandedPolicies((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
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
        <Typography.Body>Unable to load policies.</Typography.Body>
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

      {/* Info Section */}
      <Sheet variant="soft" color="primary" sx={{ p: 2, borderRadius: "lg" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FileText size={20} />
          <Typography.Body size="sm">
            Define your business policies clearly to set expectations for your
            guests. Well-written policies help prevent disputes and ensure
            smooth operations.
          </Typography.Body>
        </Box>
      </Sheet>

      {/* Policy Accordions */}
      <AccordionGroup sx={{ maxWidth: "100%" }}>
        {policyFields.map((field) => (
          <Accordion
            key={field.key}
            expanded={expandedPolicies.includes(field.key)}
            onChange={() => toggleAccordion(field.key)}
          >
            <AccordionSummary indicator={<ChevronDown />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {field.icon}
                <Typography.Label size="normal">{field.label}</Typography.Label>
                {policies[field.key] && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "success.500",
                      ml: 1,
                    }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography.Body size="xs" color="secondary">
                  {field.description}
                </Typography.Body>
                <Textarea
                  minRows={4}
                  maxRows={10}
                  placeholder={field.placeholder}
                  value={policies[field.key] ?? ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionGroup>

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
          {saving ? "Saving..." : "Save Policies"}
        </Button>
      </Box>
    </Box>
  );
};

export default PolicyTextsTab;
