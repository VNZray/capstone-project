import Text from "@/src/components/Text";
import Button from "@/src/components/Button";

import React from "react";
import type { Business } from "@/src/types/Business";
import Input from "@/src/components/Input";
import CardHeader from "@/src/components/CardHeader";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};
const StepContact: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  data,
  setData,
}) => {
  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader title="Contact Information" color="white" margin="0 0 20px 0" />

        <div className="content">
          <Input
            type="email"
            label="Business Email"
            placeholder="Enter your business email"
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <Input
            type="text"
            label="Phone Number"
            placeholder="Enter your phone number"
            value={data.phone_number}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone_number: e.target.value }))
            }
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 300 }}>
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
    </div>
  );
};

export default StepContact;
