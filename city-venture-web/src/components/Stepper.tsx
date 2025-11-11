import {
  Stepper as MuiStepper,
  Step,
  StepLabel,
  useMediaQuery,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import type { StepIconProps } from "@mui/material";
import { MdCheck } from "react-icons/md";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { colors } from "../utils/Colors";
import Typography from "@/src/components/Typography";
type StepperProps = {
  currentStep: number; // index starting at 0
  steps: string[]; // steps provided by parent
  orientation?: "horizontal" | "vertical" | "auto"; // explicit orientation option
};

/** Custom Step Icon with React Icons */
const StepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ ownerState }) => ({
  // sizes in rem for scalability
  zIndex: 1,
  width: "2.5rem", // ~40px
  height: "2.5rem",
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
  flexShrink: 0,
  fontSize: "clamp(0.875rem, calc(0.4vw + 0.5rem), 1.125rem)",
  backgroundColor:
    ownerState.completed || ownerState.active ? colors.primary : "#e0e0e0",
  color: ownerState.completed || ownerState.active ? "#fff" : "#888",
}));

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;
  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {completed ? (
        <MdCheck
          style={{ fontSize: "clamp(1rem, calc(0.4vw + 0.75rem), 1.25rem)" }}
        />
      ) : (
        icon
      )}
    </StepIconRoot>
  );
}

// Connector line touches the 2.5rem icon circle edges (both orientations)
const CenteredConnector = styled(StepConnector)(() => ({
  // Horizontal (alternativeLabel places labels under icons)
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: "1.25rem", // center line at icon center vertically
    // extend 1px into the circle on both ends so it visually touches
    left: "calc(-50%)",
    right: "calc(50%)",
  },
  // Vertical layout: align connector under icon center
  [`&.${stepConnectorClasses.vertical}`]: {
    marginLeft: "1.25rem",
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#e0e0e0",
  },
  [`& .${stepConnectorClasses.lineHorizontal}`]: {
    borderTopWidth: 2,
  },
  [`& .${stepConnectorClasses.lineVertical}`]: {
    borderLeftWidth: 2,
    // start 1px above the icon center and extend 1px into the next icon
    marginTop: "calc(1.25rem - 1px)",
    minHeight: "calc(100% - 2.5rem + 2px)",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: colors.primary,
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: colors.primary,
  },
}));

export default function Stepper({
  currentStep,
  steps,
  orientation = "auto",
}: StepperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const computedOrientation =
    orientation === "auto"
      ? isMobile
        ? "horizontal"
        : "vertical"
      : orientation;

  return (
    <MuiStepper
      activeStep={currentStep}
      orientation={computedOrientation}
      connector={<CenteredConnector />}
      // spacing, sizing use rem; allow horizontal scroll on mobile if long labels
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: { xs: "auto", sm: "90%" },
        overflowX: computedOrientation === "horizontal" ? "auto" : "visible",
      }}
      alternativeLabel={computedOrientation === "horizontal"}
    >
      {steps.map((label) => (
        <Step
          key={label}
          sx={{
            // Center layout in horizontal mode; compact spacing on mobile
            ...(computedOrientation === "horizontal"
              ? { display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 0", px: "0.5rem" }
              : { mx: isMobile ? "0.25rem" : 0 }),
          }}
        >
          <StepLabel
            slots={{ stepIcon: CustomStepIcon }}
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              // Center the MUI StepLabel internal containers
              "& .MuiStepLabel-labelContainer": {
                width: "100%",
                display: "flex",
                justifyContent: "center",
              },
              "& .MuiStepLabel-label": {
                width: "100%",
                textAlign: "center",
              },
              "& .MuiStepLabel-iconContainer": {
                display: "flex",
                justifyContent: "center",
              },
            }}
          >
            <Typography.Label size="sm" align="center">
              {label}
            </Typography.Label>
          </StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}
