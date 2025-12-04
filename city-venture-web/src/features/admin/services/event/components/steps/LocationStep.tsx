import React from "react";
import {
  Input,
  Select,
  Option,
  FormControl,
  FormLabel,
  Stack,
  Grid,
  FormHelperText,
  Divider,
  Typography,
} from "@mui/joy";
import type { EventFormData } from "@/src/types/Event";
import type { Province, Municipality, Barangay } from "@/src/types";
import MapInput from "../MapInput";

interface LocationStepProps {
  formData: EventFormData;
  provinces: Province[];
  municipalities: Municipality[];
  barangays: Barangay[];
  selectedProvince: string;
  selectedMunicipality: string;
  onInputChange: (field: keyof EventFormData, value: any) => void;
  onLocationChange: (type: "province" | "municipality" | "barangay", value: string) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  formData,
  provinces,
  municipalities,
  barangays,
  selectedProvince,
  selectedMunicipality,
  onInputChange,
  onLocationChange,
}) => {
  // Filter municipalities based on selected province
  const filteredMunicipalities = municipalities.filter(
    (m) => !selectedProvince || m.province_id.toString() === selectedProvince
  );

  // Filter barangays based on selected municipality
  const filteredBarangays = barangays.filter(
    (b) => !selectedMunicipality || b.municipality_id.toString() === selectedMunicipality
  );

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormControl>
            <FormLabel>Venue Name</FormLabel>
            <Input
              placeholder="e.g. City Convention Center"
              value={formData.venue_name}
              onChange={(e) => onInputChange("venue_name", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl>
            <FormLabel>Street Address</FormLabel>
            <Input
              placeholder="e.g. 123 Main St."
              value={formData.address}
              onChange={(e) => onInputChange("address", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} md={4}>
          <FormControl>
            <FormLabel>Province</FormLabel>
            <Select
              placeholder="Select Province"
              value={selectedProvince}
              onChange={(_, value) => onLocationChange("province", value as string)}
              slotProps={{ listbox: { sx: { zIndex: 9999 } } }}
            >
              {provinces.map((p) => (
                <Option key={p.id} value={p.id.toString()}>
                  {p.province}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12} md={4}>
          <FormControl>
            <FormLabel>Municipality</FormLabel>
            <Select
              placeholder="Select Municipality"
              value={selectedMunicipality}
              onChange={(_, value) => onLocationChange("municipality", value as string)}
              disabled={!selectedProvince}
              slotProps={{ listbox: { sx: { zIndex: 9999 } } }}
            >
              {filteredMunicipalities.map((m) => (
                <Option key={m.id} value={m.id.toString()}>
                  {m.municipality}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12} md={4}>
          <FormControl required>
            <FormLabel>Barangay</FormLabel>
            <Select
              placeholder="Select Barangay"
              value={formData.barangay_id}
              onChange={(_, value) => onLocationChange("barangay", value as string)}
              disabled={!selectedMunicipality}
              slotProps={{ listbox: { sx: { zIndex: 9999 } } }}
            >
              {filteredBarangays.map((b) => (
                <Option key={b.id} value={b.id.toString()}>
                  {b.barangay}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>Latitude</FormLabel>
            <Input
              placeholder="e.g. 14.5995"
              value={formData.latitude}
              onChange={(e) => onInputChange("latitude", e.target.value)}
            />
            <FormHelperText>Decimal degrees</FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>Longitude</FormLabel>
            <Input
              placeholder="e.g. 120.9842"
              value={formData.longitude}
              onChange={(e) => onInputChange("longitude", e.target.value)}
            />
            <FormHelperText>Decimal degrees</FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography level="body-sm" sx={{ mb: 1, color: "neutral.600" }}>
            Click on the map or drag the marker to set the location
          </Typography>
          <MapInput
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={(lat, lng) => {
              onInputChange("latitude", lat);
              onInputChange("longitude", lng);
            }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default LocationStep;
