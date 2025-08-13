import React from "react";
import { MdCheck } from "react-icons/md";

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
  currentStep: number;
};

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div style={{ padding: 20, maxWidth: 300, height: "90%" }}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 24,
              position: "relative",
            }}
          >
            {/* Line above (except for first) */}
            {index !== 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -36,
                  left: 20,
                  width: 2,
                  height: 50,
                  backgroundColor: isCompleted ? "#0A1B47" : "#e0e0e0",
                  zIndex: 0,
                }}
              />
            )}

            {/* Circle */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: isCompleted
                  ? "#0A1B47"
                  : isActive
                  ? "#0A1B47"
                  : "#e0e0e0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
                color: isActive || isCompleted ? "#fff" : "#888",
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              {isCompleted ? <MdCheck size={20} /> : <span>{index + 1}</span>}
            </div>

            {/* Label */}
            <div
              style={{
                marginLeft: 10,
                color: isCompleted || isActive ? "#0A1B47" : "#888",
                fontWeight: isActive ? "bold" : "normal",
                userSelect: "none",
              }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
}
