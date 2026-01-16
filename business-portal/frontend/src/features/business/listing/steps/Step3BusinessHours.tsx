import React from "react";
import { FormControl, Input, Box, Grid } from "@mui/joy";
import { Switch } from "@mui/material";
import Typography from "@/src/components/Typography";
import type { Business, BusinessHours } from "@/src/types/Business";
import { colors } from "@/src/utils/Colors";

type Props = {
  data: Business;
  businessHours: BusinessHours[];
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
};

const Step3BusinessHours: React.FC<Props> = ({
  businessHours,
  setBusinessHours,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography.Header sx={{ mb: 1, color: colors.primary }}>
        Business Hours
      </Typography.Header>
      <Typography.Body sx={{ mb: 4, color: colors.gray, fontSize: "0.95rem" }}>
        When is your business open for customers?
      </Typography.Body>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControl>
          <Typography.Label>Set your operating hours</Typography.Label>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {businessHours.map((hour, index) => (
              <Box
                key={`${hour.day_of_week}-${index}`}
                sx={{
                  border: `1px solid ${colors.tertiary}`,
                  borderRadius: "8px",
                  padding: 2,
                  backgroundColor: colors.white,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid xs={12} sm={2.5}>
                    <Typography.Label sx={{ fontWeight: 600 }}>
                      {hour.day_of_week}
                    </Typography.Label>
                  </Grid>
                  <Grid xs={5} sm={3.5}>
                    <Input
                      type="time"
                      value={hour.open_time}
                      disabled={!hour.is_open}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setBusinessHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, open_time: newTime } : h
                          )
                        );
                      }}
                      sx={{
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        backgroundColor: hour.is_open
                          ? colors.white
                          : colors.tertiary,
                      }}
                    />
                  </Grid>
                  <Grid xs={2} sm={1} sx={{ textAlign: "center" }}>
                    <Typography.Body sx={{ color: colors.gray }}>
                      to
                    </Typography.Body>
                  </Grid>
                  <Grid xs={5} sm={3.5}>
                    <Input
                      type="time"
                      value={hour.close_time}
                      disabled={!hour.is_open}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setBusinessHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, close_time: newTime } : h
                          )
                        );
                      }}
                      sx={{
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        backgroundColor: hour.is_open
                          ? colors.white
                          : colors.tertiary,
                      }}
                    />
                  </Grid>
                  <Grid
                    xs={12}
                    sm={1.5}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography.Label
                      sx={{
                        fontSize: "0.8rem",
                        color: hour.is_open ? colors.success : colors.error,
                      }}
                    >
                      {hour.is_open ? "Open" : "Closed"}
                    </Typography.Label>
                    <Switch
                      size="small"
                      checked={hour.is_open}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setBusinessHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, is_open: checked } : h
                          )
                        );
                      }}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: colors.success,
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: colors.success,
                          },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Step3BusinessHours;
