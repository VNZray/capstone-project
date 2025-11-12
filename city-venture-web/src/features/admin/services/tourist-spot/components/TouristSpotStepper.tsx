import React from "react";
import { Box, Stack, Divider } from "@mui/joy";
import { User, MapPin, Share2, Clock, ImageIcon, CheckCircle, Check, X } from "lucide-react";
import Button from "@/src/components/Button";
import ResponsiveText from "@/src/components/ResponsiveText";
import type { TouristSpotFormData } from "@/src/types/TouristSpot";

export interface TouristSpotStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  mode: "add" | "edit";
  loading: boolean;
  formData: TouristSpotFormData;
  children?: React.ReactNode;
}

const stepData = [
  { label: "Basic", icon: User },
  { label: "Location", icon: MapPin },
  { label: "Socials", icon: Share2 },
  { label: "Hours", icon: Clock },
  { label: "Images", icon: ImageIcon },
  { label: "Review", icon: CheckCircle },
];

const TouristSpotStepper: React.FC<TouristSpotStepperProps> = ({
  currentStep,
  onStepChange,
  onNext,
  onBack,
  onCancel,
  mode,
  loading,
  formData,
  children,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === stepData.length - 1;

  const canAccessStep = (step: number) => {
    if (step === 0) return true;
    if (step === 1) return !!(formData.name && formData.description && formData.category_ids.length > 0);
    if (step === 2) return !!(formData.province_id && formData.municipality_id && formData.barangay_id);
    return true;
  };

  const StepIndicator: React.FC<{ 
    step: number;
    label: string;
    icon: React.ElementType;
  }> = ({ step, label, icon: Icon }) => {
    const isCompleted = step < currentStep;
    const isActive = step === currentStep;
    const disabled = !canAccessStep(step);
    return (
      <Box
        onClick={!disabled ? () => onStepChange(step) : undefined}
        sx={{
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          position: "relative",
          opacity: disabled ? 0.5 : 1,
          transition: "opacity .2s ease",
          '&:hover': { opacity: disabled ? 0.5 : 0.85 }
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            backgroundColor: isCompleted || isActive ? "var(--primary-color, #0A1B47)" : "#e2e8f0",
            color: isCompleted || isActive ? "#ffffff" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            fontSize: 18,
            fontWeight: 600,
            boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.08)",
            border: isActive ? "3px solid #0A1B47" : "2px solid transparent",
            transition: "all .25s ease"
          }}
        >
          {isCompleted ? <Check size={20} /> : <Icon size={20} />}
        </Box>
        <ResponsiveText type="label-small" weight={isActive ? "semi-bold" : "normal"} color={isCompleted || isActive ? "#0A1B47" : "#64748b"}>
          {label}
        </ResponsiveText>
        {step < stepData.length - 1 && (
          <Box
            sx={{
              position: "absolute",
              top: 21,
              left: "50%",
              width: "100%",
              height: 2,
              backgroundColor: isCompleted ? "var(--primary-color, #0A1B47)" : "#e2e8f0",
              zIndex: -1,
            }}
          />
        )}
      </Box>
    );
  };

  return (
  <Box sx={{ width: "100%", maxWidth: 860, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <ResponsiveText type="title-medium" weight="semi-bold" color="#0A1B47">
            {mode === "edit" ? "Edit Tourist Spot" : "Add Tourist Spot"}
          </ResponsiveText>
          <ResponsiveText type="label-small" color="#64748b">
            Step {currentStep + 1} of {stepData.length}
          </ResponsiveText>
        </Stack>
        <Stack direction="row" spacing={0} sx={{ position: "relative", mb: 3 }}>
          {stepData.map((s, i) => (
            <StepIndicator key={s.label} step={i} label={s.label} icon={s.icon} />
          ))}
        </Stack>
        <Divider />
      </Box>

      {/* Content */}
      <Box sx={{ mb: 4, minHeight: 550 }}>{children}</Box>

      {/* Navigation */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          colorScheme="gray"
          startDecorator={<X size={16} />}
          onClick={onCancel}
          size="sm"
          disabled={loading}
        >
          Cancel
        </Button>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            colorScheme="primary"
            onClick={onBack}
            disabled={isFirstStep || loading}
            size="sm"
          >
            Back
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            onClick={onNext}
            disabled={loading}
            size="sm"
            loading={loading}
          >
            {isLastStep ? (mode === "edit" ? "Save Changes" : "Submit Spot") : "Next"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TouristSpotStepper;
