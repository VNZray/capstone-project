import React from "react";
import { Box, Stack, Typography as JoyTypography } from "@mui/joy";
import { User, MapPin, Share2, Clock, Info, Image } from "lucide-react";
import Button from "@/src/components/Button";
import type { EventFormData } from "@/src/types/Event";

export interface EventStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  mode: "add" | "edit";
  loading: boolean;
  formData: EventFormData;
  children?: React.ReactNode;
}

const stepData = [
  { label: "Basic", icon: User },
  { label: "Location", icon: MapPin },
  { label: "Schedule", icon: Clock },
  { label: "Details", icon: Info },
  { label: "Images", icon: Image },
  { label: "Socials", icon: Share2 },
];

const EventStepper: React.FC<EventStepperProps> = ({
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

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        const hasCategory = !!(
          formData.event_category_id || 
          (formData.event_category_ids && formData.event_category_ids.length > 0)
        );
        return !!(
          formData.name?.trim() && 
          formData.description?.trim() && 
          hasCategory
        );
      case 1: // Location
        return !!(formData.barangay_id || formData.venue_name?.trim() || formData.address?.trim());
      case 2: // Schedule
        return !!(formData.start_date && formData.end_date);
      case 3: // Details
        return true; // Details are optional
      case 4: // Images
        return true; // Images are optional
      case 5: // Socials
        return true; // Socials are optional
      default:
        return true;
    }
  };

  // Check if a step can be accessed
  const canAccessStep = (step: number): boolean => {
    // In edit mode, allow accessing any step
    if (mode === "edit") return true;
    
    // In add mode, can only access current step or previous steps
    // Can only go forward if current and all previous steps are valid
    if (step <= currentStep) return true;
    
    // To access a future step, all previous steps must be valid
    for (let i = 0; i < step; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  };

  // Check if Next button should be enabled
  const canProceedToNext = (): boolean => {
    if (mode === "edit") return true;
    return isStepValid(currentStep);
  };

  const StepIndicator: React.FC<{ 
    index: number; 
    label: string; 
    icon: React.ElementType;
    isActive: boolean;
    isCompleted: boolean;
  }> = ({ index, label, icon: Icon, isActive, isCompleted }) => (
    <Stack 
      direction="row" 
      alignItems="center" 
      spacing={1}
      onClick={() => canAccessStep(index) && onStepChange(index)}
      sx={{ 
        cursor: canAccessStep(index) ? "pointer" : "not-allowed",
        opacity: canAccessStep(index) ? 1 : 0.5,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: isActive ? "primary.500" : isCompleted ? "success.500" : "neutral.200",
          color: isActive || isCompleted ? "white" : "neutral.500",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        <Icon size={16} />
      </Box>
      <JoyTypography
        level="body-sm"
        fontWeight={isActive ? "lg" : "md"}
        textColor={isActive ? "primary.700" : "neutral.600"}
        sx={{ display: { xs: "none", md: "block" } }}
      >
        {label}
      </JoyTypography>
    </Stack>
  );

  return (
    <Stack sx={{ height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "neutral.200", bgcolor: "white" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <JoyTypography level="h4">
            {mode === "add" ? "Add New Event" : "Edit Event"}
          </JoyTypography>
          <Button variant="plain" colorScheme="gray" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>

        {/* Stepper */}
        <Box sx={{ position: "relative", px: 2 }}>
          {/* Progress Line */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 40,
              right: 40,
              height: 2,
              bgcolor: "neutral.200",
              zIndex: 0,
              display: { xs: "none", md: "block" }
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${(currentStep / (stepData.length - 1)) * 100}%`,
                bgcolor: "primary.500",
                transition: "width 0.3s ease",
              }}
            />
          </Box>

          <Stack direction="row" justifyContent="space-between" sx={{ position: "relative" }}>
            {stepData.map((step, index) => (
              <StepIndicator
                key={step.label}
                index={index}
                label={step.label}
                icon={step.icon}
                isActive={currentStep === index}
                isCompleted={currentStep > index}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", p: 3, bgcolor: "neutral.50" }}>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          {children}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "neutral.200", bgcolor: "white" }}>
        <Stack direction="row" justifyContent="space-between" maxWidth={800} mx="auto">
          <Button
            variant="outlined"
            colorScheme="gray"
            onClick={onBack}
            disabled={isFirstStep || loading}
          >
            Back
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            onClick={onNext}
            loading={loading}
            disabled={!canProceedToNext() && !isLastStep}
          >
            {isLastStep ? (mode === "add" ? "Create Event" : "Save Changes") : "Next"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default EventStepper;
