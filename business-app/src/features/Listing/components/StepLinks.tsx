import Text from "@/src/components/Text";
import Button from "@/src/components/Button";
import React from "react";

type Props = {
  onNext: () => void;
  onPrev: () => void;
};
const StepLinks: React.FC<Props> = ({ onNext, onPrev }) => {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text variant="card-title">Basic Information</Text>

        <div className="content">
          <Text variant="normal">
            Please provide the basic information for your listing.
          </Text>
        </div>
        <div style={{ display: "flex", gap: 600 }}>
          <Button onClick={onPrev} variant="secondary" style={{ flex: 1 }}>
            <Text variant="normal" color="white">
              Back
            </Text>
          </Button>
          <Button onClick={onNext} variant="primary" style={{ flex: 1 }}>
            <Text variant="normal" color="white">
              Next
            </Text>
          </Button>
        </div>
      </div>    </>
  );
};

export default StepLinks;
