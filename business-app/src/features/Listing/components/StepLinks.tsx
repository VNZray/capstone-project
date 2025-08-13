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

const StepLinks: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  data,
  setData,
}) => {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text variant="header-title">Social Media Links</Text>

        <div className="content">
          <Input
            type="text"
            label="Facebook"
            placeholder="Enter your business email"
            value={data.facebook_url}
            onChange={(e) =>
              setData((prev) => ({ ...prev, facebook_url: e.target.value }))
            }
          />

          <Input
            type="text"
            label="Instagram"
            placeholder="Enter your business email"
            value={data.instagram_url}
            onChange={(e) =>
              setData((prev) => ({ ...prev, instagram_url: e.target.value }))
            }
          />

          <Input
            type="text"
            label="Tiktok"
            placeholder="Enter your business email"
            value={data.tiktok_url}
            onChange={(e) =>
              setData((prev) => ({ ...prev, tiktok_url: e.target.value }))
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

export default StepLinks;
