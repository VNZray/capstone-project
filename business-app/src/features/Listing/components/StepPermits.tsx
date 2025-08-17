import Text from "@/src/components/Text";
import Button from "@mui/joy/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepPermits: React.FC<Props> = ({
  onNext,
  onPrev,
  api,
  data,
  setData,
}) => {
  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader title="Business Permits" color="white" margin="0 0 20px 0" />

        <div className="content">
          <Text variant="normal">
            Please provide the basic information for your listing.
          </Text>
        </div>
      </div>

      <div style={{ display: "flex", gap: 300 }}>
        <Button
          color="neutral"
          startDecorator={<ArrowBackIcon />}
          onClick={onPrev}
          style={{ flex: 1 }}
          size="lg"
        >
          Back
        </Button>
        <Button
          endDecorator={<ArrowForwardIcon />}
          onClick={onNext}
          style={{ flex: 1 }}
          size="lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepPermits;
