import React from "react";
import CardHeader from "@/src/components/CardHeader";
import Container from "@/src/components/Container";
import { FormControl, FormLabel, Input, Typography } from "@mui/joy";
import { Switch } from "@mui/material";
import type { Business, BusinessHours } from "@/src/types/Business";

type Props = {
  data: Business;
  businessHours: BusinessHours[];
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
};

const Step3BusinessHours: React.FC<Props> = ({ businessHours, setBusinessHours }) => {
  return (
    <div className="br-form-wrapper" style={{ overflow: "auto", overflowX: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Business Hours"
          color="dark"
          bg="white"
          variant="title"
          padding="12px"
          radius="8px"
          margin="0 0 12px 0"
        />

        <Container padding="0 20px" gap="16px">
          <FormControl>
            <FormLabel>Set your operating hours</FormLabel>
            {businessHours.map((hour, index) => (
              <Container
                key={`${hour.day_of_week}-${index}`}
                padding="12px 0"
                align="center"
                direction="row"
                style={{ gap: "12px" }}
                className="inline-fields"
              >
                <Typography level="body-sm" data-col="3" style={{ display: "flex", alignItems: "center" }}>
                  {hour.day_of_week}
                </Typography>

                <div data-col="4">
                  <Input
                    size="md"
                    type="time"
                    value={hour.open_time}
                    readOnly={!hour.is_open}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setBusinessHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, open_time: newTime } : h))
                      );
                    }}
                  />
                </div>

                <div data-col="4">
                  <Input
                    size="md"
                    type="time"
                    value={hour.close_time}
                    readOnly={!hour.is_open}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setBusinessHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, close_time: newTime } : h))
                      );
                    }}
                  />
                </div>

                <div data-col="1" style={{ display: "flex", alignItems: "center" }}>
                  <Typography level="body-sm">{hour.is_open ? "Open" : "Closed"}</Typography>
                </div>
                <div data-col="0" style={{ display: "flex", alignItems: "center" }}>
                  <Switch
                    checked={hour.is_open}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBusinessHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, is_open: checked } : h))
                      );
                    }}
                  />
                </div>
              </Container>
            ))}
          </FormControl>
        </Container>
      </div>
    </div>
  );
};

export default Step3BusinessHours;
