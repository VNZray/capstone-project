import Text from "@/src/components/Text";
import React from "react";
import type { Business } from "@/src/types/Business";
import Input from "@/src/components/Input";
import CardHeader from "@/src/components/CardHeader";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

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
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Business Pricing"
          color="white"
          margin="0 0 20px 0"
        />

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
      </div>

      <div style={{ display: "flex", gap: 300 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onPrev}
          style={{ flex: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          style={{ flex: 1 }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepPricing;
