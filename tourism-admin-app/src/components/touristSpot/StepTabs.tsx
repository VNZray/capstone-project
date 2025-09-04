import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider
} from "@mui/joy";
import { 
  User, 
  MapPin, 
  Share2,
  Clock, 
  ImageIcon, 
  CheckCircle,
  Check,
  X
} from "lucide-react";
import type { TouristSpotFormData } from "../../types/TouristSpot";

interface StepTabsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  formData: TouristSpotFormData; // Added formData prop
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

const StepTabs: React.FC<StepTabsProps> = ({
  currentStep,
  onStepChange,
  onNext,
  onBack,
  onCancel,
  formData,
  children
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === stepData.length - 1;

  const canAccessStep = (step: number, formData: TouristSpotFormData) => {
    if (step === 0) return true;
    if (step === 1) return !!(formData.name && formData.description && formData.category_id);
    if (step === 2) return !!(formData.province_id && formData.municipality_id && formData.barangay_id);
    return true; // Images and Review are always accessible if previous steps are valid
  };

  const StepIndicator: React.FC<{ 
    step: number; 
    currentStep: number; 
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    formData: TouristSpotFormData; // Added formData prop
  }> = ({ step, currentStep, label, icon: Icon, onClick, formData }) => {
    const isCompleted = step < currentStep;
    const isActive = step === currentStep;
    const isDisabled = !canAccessStep(step, formData);

    return (
      <Box
        onClick={!isDisabled && step <= currentStep ? onClick : undefined}
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
            width: 40,
            height: 40,
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
            mb: 1,
            border: isActive ? "2px solid" : "none",
            borderColor: "primary.solidBg"
          }}
        >
          {isCompleted ? <Check size={18} /> : <Icon size={18} />}
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
        {step < stepData.length - 1 && (
          <Box
            sx={{
              position: "absolute",
              top: 20,
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
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography level="h3">
            Edit Tourist Spot
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary" }}>
            Step {currentStep + 1} of {stepData.length}
          </Typography>
        </Stack>
        
        {/* Stepper */}
        <Stack direction="row" spacing={0} sx={{ position: "relative", mb: 3 }}>
          {stepData.map((step, index) => (
            <StepIndicator 
              key={step.label} 
              step={index} 
              currentStep={currentStep} 
              label={step.label}
              icon={step.icon}
              onClick={() => onStepChange(index)}
              formData={formData} // Pass formData to StepIndicator
            />
          ))}
        </Stack>
        
        <Divider />
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
          >
            {isLastStep ? "Save" : "Next"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default StepTabs;
