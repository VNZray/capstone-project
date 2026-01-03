/**
 * Legal Policies Tab Component
 * Manages platform-wide legal policies like Terms & Conditions and Privacy Policy
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
import { FileText, ScrollText, Lock, Save, ChevronDown } from "lucide-react";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Alert from "@/src/components/Alert";
import {
  fetchAppLegalPolicies,
  updateAppLegalPolicies,
  type AppLegalPolicies,
  type UpdateAppLegalPoliciesPayload,
} from "@/src/services/AppLegalPoliciesService";

interface PolicyField {
  key: keyof UpdateAppLegalPoliciesPayload;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  description: string;
}

const policyFields: PolicyField[] = [
  {
    key: "terms_and_conditions",
    label: "Terms and Conditions",
    icon: <ScrollText size={18} />,
    placeholder: "Enter your general terms and conditions...",
    description:
      "General terms that govern the use of the platform, user agreements, and service conditions.",
  },
  {
    key: "privacy_policy",
    label: "Privacy Policy",
    icon: <Lock size={18} />,
    placeholder: "Enter your privacy policy...",
    description:
      "Explain how the platform collects, uses, and protects user data and personal information.",
  },
];

const LegalPoliciesTab = () => {
  const [policies, setPolicies] = useState<AppLegalPolicies | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedPolicies, setExpandedPolicies] = useState<string[]>([
    "terms_and_conditions",
  ]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ type: "info", title: "", message: "" });

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppLegalPolicies();
      setPolicies(data);
    } catch (error) {
      console.error("Error loading legal policies:", error);
      // Set default empty policies if fetch fails
      setPolicies({
        terms_and_conditions: null,
        privacy_policy: null,
        version: 1,
        is_active: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const handleSave = async () => {
    if (!policies) return;
    setSaving(true);
    try {
      const payload: UpdateAppLegalPoliciesPayload = {
        terms_and_conditions: policies.terms_and_conditions,
        privacy_policy: policies.privacy_policy,
      };
      const updated = await updateAppLegalPolicies(payload);
      setPolicies(updated);
      setAlertConfig({
        type: "success",
        title: "Success",
        message: "Legal policies saved successfully!",
      });
      setShowAlert(true);
    } catch (error) {
      console.error("Error saving legal policies:", error);
      setAlertConfig({
        type: "error",
        title: "Error",
        message: "Failed to save legal policies",
      });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (
    field: keyof UpdateAppLegalPoliciesPayload,
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
          <Box>
            <Typography.Body size="sm">
              Define your platform's legal policies. These policies apply to all
              users and businesses on the platform.
            </Typography.Body>
            {policies.version > 1 && (
              <Typography.Body size="xs" color="secondary">
                Current version: {policies.version}
              </Typography.Body>
            )}
          </Box>
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
                  minRows={6}
                  maxRows={15}
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
          {saving ? "Saving..." : "Save Legal Policies"}
        </Button>
      </Box>
    </Box>
  );
};

export default LegalPoliciesTab;
