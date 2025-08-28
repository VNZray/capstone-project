import React from "react";
import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Autocomplete,
  Grid,
} from "@mui/joy";
import MapInput from "../MapInput";
import type { Option, TouristSpotFormData } from "../types";

interface LocationStepProps {
  formData: TouristSpotFormData;
  provinceOptions: Option[];
  municipalityOptions: Option[];
  barangayOptions: Option[];
  selectedProvince: Option | null;
  selectedMunicipality: Option | null;
  selectedBarangay: Option | null;
  onFormDataChange: (updater: (prev: TouristSpotFormData) => TouristSpotFormData) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  formData,
  provinceOptions,
  municipalityOptions,
  barangayOptions,
  selectedProvince,
  selectedMunicipality,
  selectedBarangay,
  onFormDataChange,
}) => {
  return (
    <Stack spacing={3}>
      <Typography level="h4">Location</Typography>
      
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <FormControl required>
            <FormLabel>Province</FormLabel>
            <Autocomplete<Option>
              options={provinceOptions}
              value={selectedProvince}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              getOptionLabel={(opt) => opt?.label ?? ""}
              onChange={(_e, val) =>
                onFormDataChange((prev) => ({
                  ...prev,
                  province_id: val?.id.toString() || "",
                  municipality_id: "",
                  barangay_id: "",
                }))
              }
              placeholder="Select Province"
            />
          </FormControl>
        </Grid>
        
        <Grid xs={12} md={4}>
          <FormControl required>
            <FormLabel>Municipality</FormLabel>
            <Autocomplete<Option>
              options={municipalityOptions}
              value={selectedMunicipality}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              getOptionLabel={(opt) => opt?.label ?? ""}
              onChange={(_e, val) =>
                onFormDataChange((prev) => ({
                  ...prev,
                  municipality_id: val?.id.toString() || "",
                  barangay_id: "",
                }))
              }
              placeholder="Select Municipality"
              disabled={!formData.province_id}
            />
          </FormControl>
        </Grid>
        
        <Grid xs={12} md={4}>
          <FormControl required>
            <FormLabel>Barangay</FormLabel>
            <Autocomplete<Option>
              options={barangayOptions}
              value={selectedBarangay}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              getOptionLabel={(opt) => opt?.label ?? ""}
              onChange={(_e, val) =>
                onFormDataChange((prev) => ({
                  ...prev,
                  barangay_id: val?.id.toString() || "",
                }))
              }
              placeholder="Select Barangay"
              disabled={!formData.municipality_id}
            />
          </FormControl>
        </Grid>
      </Grid>

      <Typography level="title-md">Location on Map</Typography>
      <MapInput
        latitude={formData.latitude}
        longitude={formData.longitude}
        onChange={(lat, lng) =>
          onFormDataChange((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }))
        }
      />
    </Stack>
  );
};

export default LocationStep;
