import Text from "@/src/components/Text";
import Button from "@/src/components/Button";
import React from "react";
import type { Business } from "@/src/types/Business";
import Input from "@/src/components/Input";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepPricing: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  data,
  setData,
}) => {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text variant="header-title">Price Range</Text>

        <div className="content">
          <Input
            type="email"
            label="Minimum Rate"
            placeholder="Product/Room rates"
            value={data.min_price}
            onChange={(e) =>
              setData((prev) => ({ ...prev, min_price: e.target.value }))
            }
          />

          <Input
            type="email"
            label="Maximum Rate"
            placeholder="Product/Room rates"
            value={data.max_price}
            onChange={(e) =>
              setData((prev) => ({ ...prev, max_price: e.target.value }))
            }
          />
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

export default StepPricing;
