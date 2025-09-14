import React from "react";
import { 
  Stack, 
  Typography, 
  Box, 
  Button,
  Divider
} from "@mui/joy";
import { Check, X } from "lucide-react";
import type { TouristSpotFormData } from "@/src/types/TouristSpot";

const steps = [
  "Basic",
  "Location", 
  "Socials",
  "Hours",
  "Images",
  "Review"
];

type TouristSpotStepperProps = {
  currentStep: number; // index starting at 0
  onStepChange: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  mode?: "add" | "edit";
  loading?: boolean;
  formData: TouristSpotFormData; // Added formData prop
};

export default function TouristSpotStepper({ 
  currentStep, 
  onStepChange, 
  onNext, 
  onBack, 
  onCancel,
  children,
  mode = "edit",
  loading = false,
  formData
}: TouristSpotStepperProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const canAccessStep = (step: number, formData: TouristSpotFormData) => {
    if (step === 0) return true;
    if (step === 1) return !!(formData.name && formData.description && formData.category_ids && formData.category_ids.length > 0);
    if (step === 2) return !!(formData.province_id && formData.municipality_id && formData.barangay_id);
    return true; // Images and Review are always accessible if previous steps are valid
  };

  const StepIndicator: React.FC<{ 
    step: number; 
    currentStep: number; 
    label: string;
    onClick: () => void;
    formData: TouristSpotFormData; // Added formData prop
  }> = ({ step, currentStep, label, onClick, formData }) => {
    const isCompleted = step < currentStep;
    const isActive = step === currentStep;
    const isDisabled = !canAccessStep(step, formData);

    return (
      <Box
        onClick={!isDisabled ? onClick : undefined}
        sx={{
          cursor: isDisabled ? "not-allowed" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          position: "relative",
          opacity: isDisabled ? 0.5 : 1,
          "&:hover": {
            opacity: isDisabled ? 0.5 : 0.8
          }
        }}
      >
        {/* Step Circle */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: isCompleted
              ? "primary.solidBg"
              : isActive
              ? "primary.solidBg"
              : "neutral.outlinedBorder",
            color: isCompleted || isActive ? "primary.solidColor" : "text.tertiary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "sm",
            fontWeight: "bold",
            mb: 1,
            border: isActive ? "2px solid" : "none",
            borderColor: isActive ? "primary.solidBg" : "neutral.outlinedBorder"
          }}
        >
          {isCompleted ? <Check size={16} /> : step + 1}
        </Box>
        
        {/* Step Label */}
        <Typography 
          level="body-xs" 
          sx={{ 
            color: isCompleted || isActive ? "text.primary" : "text.tertiary",
            fontWeight: isActive ? "bold" : "normal",
            textAlign: "center"
          }}
        >
          {label}
        </Typography>
        
        {/* Connecting Line */}
        {step < steps.length - 1 && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: "50%",
              width: "100%",
              height: 2,
              backgroundColor: isCompleted ? "primary.solidBg" : "neutral.outlinedBorder",
              zIndex: -1
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: "95%", maxWidth: 1100, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography level="h3">
            {mode === "add" ? "Add New Tourist Spot" : "Edit Tourist Spot"}
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary" }}>
            Step {currentStep + 1} of {steps.length}
          </Typography>
        </Stack>
                
        <Stack>
          <Divider sx={{ my: 2 }} />
        </Stack>
        
        {/* Stepper */}
        <Stack direction="row" spacing={0} sx={{ position: "relative", mb: 2 }}>
          {steps.map((label, index) => (
            <StepIndicator 
              key={label} 
              step={index} 
              currentStep={currentStep} 
              label={label}
              onClick={() => onStepChange(index)}
              formData={formData}
            />
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Content Area */}
      <Box sx={{ mb: 4, minHeight: 400 }}>
        {children}
      </Box>

      {/* Navigation Buttons */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<X size={16} />}
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            disabled={isFirstStep}
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            variant="solid"
            onClick={onNext}
            disabled={loading}
          >
            {loading 
              ? "Processing..." 
              : isLastStep 
                ? "Save" 
                : "Next"
            }
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
