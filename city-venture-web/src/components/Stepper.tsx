import {
  Stepper as MuiStepper,
  Step,
  StepLabel,
} from "@mui/material";
import type { StepIconProps } from "@mui/material";
import { MdCheck } from "react-icons/md";
import { styled } from "@mui/material/styles";

const steps = [
  "Basics",
  "Contact",
  "Location",
  "Description",
  "Links",
  "Pricing",
  "Permits",
  "Review",
  "Submit",
];

type StepperProps = {
  currentStep: number; // index starting at 0
};

/** Custom Step Icon with React Icons */
const StepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ ownerState }) => ({
  backgroundColor: ownerState.completed
    ? "#0A1B47"
    : ownerState.active
    ? "#0A1B47"
    : "#e0e0e0",
  zIndex: 1,
  color: ownerState.active || ownerState.completed ? "#fff" : "#888",
  width: 40,
  height: 40,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
  flexShrink: 0,
}));

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;
  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {completed ? <MdCheck size={20} /> : icon}
    </StepIconRoot>
  );
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <MuiStepper
      activeStep={currentStep}
      orientation="vertical"
      connector={null}
      sx={{ padding: 2, maxWidth: 300, height: "90%" }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel slots={{ stepIcon: CustomStepIcon }}>{label}</StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}
