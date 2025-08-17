import Text from "@/src/components/Text";
import { FormControl, FormLabel, Input, Button } from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  onNext: () => void;
  onPrev: () => void;
};
const StepContact: React.FC<Props> = ({
  onNext,
  onPrev,
  api,
  data,
  setData,
}) => {
  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Contact Information"
          color="white"
          margin="0 0 20px 0"
        />

        <div className="content">
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              size="lg"
              type="email"
              placeholder="Enter your business email"
              value={data.email}
              onChange={(e) =>
                setData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Phone Number</FormLabel>
            <Input
              size="lg"
              type="tel"
              placeholder="Enter your phone number"
              value={data.phone_number}
              onChange={(e) =>
                setData((prev) => ({ ...prev, phone_number: e.target.value }))
              }
            />
          </FormControl>
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

export default StepContact;
