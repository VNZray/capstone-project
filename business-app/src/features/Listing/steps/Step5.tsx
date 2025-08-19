import React from "react";
import type { Business } from "@/src/types/Business";
import Input from "@/src/components/Input";
import CardHeader from "@/src/components/CardHeader";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;

};

const Step5: React.FC<Props> = ({

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
    </div>
  );
};

export default Step5;
