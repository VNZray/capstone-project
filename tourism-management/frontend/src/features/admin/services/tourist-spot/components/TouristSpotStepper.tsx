import React from "react";
import { Box } from "@mui/joy";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";

export interface TouristSpotStepperProps {
  currentStep: number;
  totalSteps: number;
  children?: React.ReactNode;
}

const stepTitles = [
  "Basic Information",
  "Location Details",
  "Social Media & Contact",
  "Operating Hours",
  "Images & Gallery",
  "Review & Submit",
];

const TouristSpotStepper: React.FC<TouristSpotStepperProps> = ({
  currentStep,
  totalSteps,
  children,
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Progress Header */}
      <Box
        sx={{
          padding: "clamp(1rem, 3vw, 1.5rem)",
          paddingRight: "clamp(3rem, 8vw, 4rem)",
          borderBottom: `1px solid #e0e0e0`,
        }}
      >
        {/* Step Counter */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography.CardTitle sx={{ color: colors.primary }}>
            {stepTitles[currentStep]}
          </Typography.CardTitle>
          <Typography.Body
            size="sm"
            sx={{
              color: colors.gray,
              fontWeight: 600,
            }}
          >
            Step {currentStep + 1} of {totalSteps}
          </Typography.Body>
        </Box>

        {/* Progress Bar */}
        <Box
          sx={{
            width: "100%",
            height: "8px",
            backgroundColor: colors.offWhite,
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: colors.primary,
              transition: "width 0.3s ease",
              borderRadius: "4px",
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default TouristSpotStepper;
