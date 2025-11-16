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
import type { FormOption, TouristSpotFormData } from "@/src/types/TouristSpot";

interface LocationStepProps {
  formData: TouristSpotFormData;
  provinceOptions: FormOption[];
  municipalityOptions: FormOption[];
  barangayOptions: FormOption[];
  selectedProvince: FormOption | null;
  selectedMunicipality: FormOption | null;
  selectedBarangay: FormOption | null;
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
    <Stack spacing={1}>
      <Typography level="h4">Location</Typography>
      
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <FormControl required>
            <FormLabel>Province</FormLabel>
            <Autocomplete<FormOption>
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
              slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
              placeholder="Select Province"
            />
          </FormControl>
        </Grid>
        
        <Grid xs={12} md={4}>
          <FormControl required>
            <FormLabel>Municipality</FormLabel>
            <Autocomplete<FormOption>
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
              slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
              placeholder="Select Municipality"
              disabled={!formData.province_id}
            />
          </FormControl>
        </Grid>
        
        <Grid xs={12} md={4}>
          <FormControl required>
            <FormLabel>Barangay</FormLabel>
            <Autocomplete<FormOption>
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
              slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
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
