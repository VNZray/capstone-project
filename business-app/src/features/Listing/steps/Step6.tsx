import Text from "@/src/components/Text";
import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
};

const StepPermits: React.FC<Props> = ({ api, data, setData }) => {
  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Business Permits"
          color="white"
          margin="0 0 20px 0"
        />

        <div className="content">
          <Text variant="normal">
            Please provide the basic information for your listing.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default StepPermits;
