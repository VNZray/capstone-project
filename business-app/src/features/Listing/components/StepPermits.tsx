import Text from "@/src/components/Text";
import Button from "@/src/components/Button";
import React from "react";
import type { Business } from "@/src/types/Business";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepPermits: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  data,
  setData,
}) => {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text variant="header-title">Basic Information</Text>

        <div className="content">
          <Text variant="normal">
            Please provide the basic information for your listing.
          </Text>
        </div>
        <div style={{ display: "flex", gap: 400 }}>
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
      </div>{" "}
    </>
  );
};

export default StepPermits;
