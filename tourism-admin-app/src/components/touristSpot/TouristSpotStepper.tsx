import React from "react";
import { 
  Stack, 
  Typography, 
  Box, 
  Chip 
} from "@mui/joy";
import { Check } from "lucide-react";

const steps = [
  "Basic Info",
  "Location", 
  "Schedule",
  "Images",
  "Review"
];

type TouristSpotStepperProps = {
  currentStep: number; // index starting at 0
};

const StepIcon: React.FC<{ 
  step: number; 
  currentStep: number; 
  label: string; 
}> = ({ step, currentStep, label }) => {
  const isCompleted = step < currentStep;
  const isActive = step === currentStep;

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
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
          flexShrink: 0,
        }}
      >
        {isCompleted ? <Check size={16} /> : step + 1}
      </Box>
      <Typography 
        level="body-sm" 
        sx={{ 
          color: isCompleted || isActive ? "text.primary" : "text.tertiary",
          fontWeight: isActive ? "bold" : "normal"
        }}
      >
        {label}
      </Typography>
      {isActive && (
        <Chip size="sm" variant="soft" color="primary">
          Current
        </Chip>
      )}
    </Stack>
  );
};

export default function TouristSpotStepper({ currentStep }: TouristSpotStepperProps) {
  return (
    <Box 
      sx={{ 
        p: 2, 
        borderRadius: 8, 
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.surface",
        minWidth: 200,
        height: "fit-content"
      }}
    >
      <Typography level="title-sm" sx={{ mb: 2 }}>
        Progress
      </Typography>
      <Stack spacing={1}>
        {steps.map((label, index) => (
          <StepIcon 
            key={label} 
            step={index} 
            currentStep={currentStep} 
            label={label} 
          />
        ))}
      </Stack>
    </Box>
  );
}
