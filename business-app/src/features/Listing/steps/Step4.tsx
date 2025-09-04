import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";
import { FormControl, Grid, Input, Select, Option, FormLabel } from "@mui/joy";
import Container from "@/src/components/Container";
import { Facebook, Instagram, X } from "@mui/icons-material";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
};

const Step4: React.FC<Props> = ({
  data,
  setData,
}) => {


  return (
    <div
      className="stepperContent"
      style={{ overflow: "auto", overflowX: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflowY: "auto",
        }}
      >
        <CardHeader
          title="Social Media"
          color="white"
          margin="0 0 20px 0"
        />

        <Grid container columns={12}>
          {/* Social Media Links */}
          <Grid xs={4}>
            <Container padding="0 20px " gap="20px">
              {[
                {
                  platform: "Facebook",
                  icon: <Facebook sx={{ color: "#1877f2" }} />,
                },
                {
                  platform: "Instagram",
                  icon: <Instagram sx={{ color: "#E1306C" }} />,
                },
                {
                  platform: "X",
                  icon: <X sx={{ color: "#000" }} />,
                },
              ].map(({ platform, icon }) => (
                <FormControl key={platform}>
                  <FormLabel>{platform}</FormLabel>
                  <Input
                    variant="outlined"
                    size="md"
                    startDecorator={icon}
                    value={(data as any)[`${platform.toLowerCase()}_url`] || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        [`${platform.toLowerCase()}_url`]: e.target.value,
                      }))
                    }
                    placeholder={`https://${platform.toLowerCase()}.com/yourpage`}
                    sx={{
                      borderRadius: "12px",
                      "& input": { pl: 1 },
                    }}
                  />
                </FormControl>
              ))}
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Step4;
