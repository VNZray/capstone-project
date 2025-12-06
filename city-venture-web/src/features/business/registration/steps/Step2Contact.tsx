import React from "react";
import { Box, Grid, FormControl, FormLabel, Input } from "@mui/joy";
import { Mail, Phone } from "lucide-react";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import type { Business } from "@/src/types/Business";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
};

const Step2Contact: React.FC<Props> = ({ data, setData }) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography.CardTitle size="md" sx={{ mb: 1, color: colors.primary }}>
          Contact Information
        </Typography.CardTitle>
        <Typography.Body size="sm" sx={{ color: colors.gray }}>
          How can customers reach your business?
        </Typography.Body>
      </Box>

      {/* Form Grid */}
      <Grid container spacing={3} justifyContent="center">
        <Grid xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Email */}
            <Grid xs={12}>
              <FormControl required>
                <FormLabel>
                  <Typography.Label size="sm">Business Email</Typography.Label>
                </FormLabel>
                <Input
                  size="lg"
                  type="email"
                  placeholder="your.business@example.com"
                  value={data.email}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  startDecorator={<Mail size={20} color={colors.primary} />}
                  sx={{
                    backgroundColor: colors.white,
                    borderColor: colors.gray,
                    "&:hover": { borderColor: colors.secondary },
                    "&:focus-within": {
                      borderColor: colors.primary,
                      boxShadow: `0 0 0 3px ${colors.primary}20`,
                    },
                  }}
                />
              </FormControl>
            </Grid>

            {/* Phone */}
            <Grid xs={12}>
              <FormControl required>
                <FormLabel>
                  <Typography.Label size="sm">Phone Number</Typography.Label>
                </FormLabel>
                <Input
                  size="lg"
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  value={data.phone_number}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  startDecorator={<Phone size={20} color={colors.primary} />}
                  sx={{
                    backgroundColor: colors.white,
                    borderColor: colors.gray,
                    "&:hover": { borderColor: colors.secondary },
                    "&:focus-within": {
                      borderColor: colors.primary,
                      boxShadow: `0 0 0 3px ${colors.primary}20`,
                    },
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step2Contact;
