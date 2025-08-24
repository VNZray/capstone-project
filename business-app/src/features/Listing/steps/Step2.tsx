import { FormControl, Grid, Input } from "@mui/joy";
import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";
import Container from "@/src/components/Container";
import Text from "@/src/components/Text";
import { EmailOutlined, Phone } from "@mui/icons-material";
import Label from "@/src/components/Label";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
};
const Step2: React.FC<Props> = ({ api, data, setData }) => {
  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Contact Information"
          color="white"
          margin="0 0 20px 0"
        />

        <Grid container columns={12}>
          <Grid xs={6}>
            <Container padding="0 20px " gap="20px">
              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="label">Email *</Text>
                </Label>
                <Input
                  size="lg"
                  type="email"
                  startDecorator={<EmailOutlined color="primary" />}
                  placeholder="Enter your business email"
                  defaultValue={data.email}
                  onBlur={(e) =>
                    setData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="label">Phone Number *</Text>
                </Label>
                <Input
                  size="lg"
                  type="tel"
                  startDecorator={<Phone color="primary" />}
                  placeholder="Enter your phone number"
                  defaultValue={data.phone_number}
                  onBlur={(e) =>
                    setData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                />
              </FormControl>
            </Container>
          </Grid>
        </Grid>

        <div className="content"></div>
      </div>
    </div>
  );
};

export default Step2;
