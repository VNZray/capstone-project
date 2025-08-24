import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";
import { FormControl, Grid, Input } from "@mui/joy";
import Container from "@/src/components/Container";
import Label from "@/src/components/Label";
import Text from "@/src/components/Text";
import { DollarSign, PhilippinePeso, PhilippinePesoIcon } from "lucide-react";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
};

const Step5: React.FC<Props> = ({ data, setData }) => {
  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Business Pricing"
          color="white"
          margin="0 0 20px 0"
        />

        <Grid container columns={12}>
          <Grid xs={6}>
            <Container padding="0 20px " gap="20px">
              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="label">Minimum Pricing *</Text>
                </Label>
                <Input
                  size="lg"
                  startDecorator={<PhilippinePeso />}
                  type="number"
                  placeholder="Minimum Pricing"
                  value={data.min_price}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, min_price: e.target.value }))
                  }
                />
              </FormControl>

              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="label">Maximum Pricing *</Text>
                </Label>
                <Input
                  size="lg"
                  type="number"
                  startDecorator={<PhilippinePeso />}
                  placeholder="Maximum Pricing"
                  value={data.max_price}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, max_price: e.target.value }))
                  }
                />
              </FormControl>
            </Container>
          </Grid>

          <Grid xs={6}>
            <Container padding="0 20px " gap="20px">
              <FormControl></FormControl>
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Step5;
