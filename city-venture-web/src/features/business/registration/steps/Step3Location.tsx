import React from "react";
import { Box, Grid } from "@mui/joy";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import MapInput from "@/src/components/MapInput";
import type { Business } from "@/src/types/Business";
import type { Address } from "@/src/types/Address";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
};

const Step3Location: React.FC<Props> = ({ data, setData }) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography.CardTitle size="md" sx={{ mb: 1, color: colors.primary }}>
          Business Location
        </Typography.CardTitle>
        <Typography.Body size="sm" sx={{ color: colors.gray }}>
          Pin your business location on the map
        </Typography.Body>
      </Box>

      {/* Map Input */}
      <Grid container spacing={3}>
        <Grid xs={12}>
          <MapInput
            latitude={data.latitude}
            longitude={data.longitude}
            onChange={(lat, lng) => {
              setData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step3Location;
