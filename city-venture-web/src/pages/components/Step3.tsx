import Typography from "@/src/components/Typography";
import MapInput from "@/src/components/MapInput";
import {
  AddressService,
  type Barangay,
  type Municipality,
  type Province,
} from "@/src/services/AddressService";
import type { Address } from "@/src/types/Address";
import type { Business } from "@/src/types/Business";
import { FormControl, Input, Box, Grid, Select, Option } from "@mui/joy";
import React from "react";
import { colors } from "@/src/utils/Colors";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
};

const Step3: React.FC<Props> = ({
  data,
  setData,
  addressData,
  setAddressData,
}) => {
  const [province, setProvince] = React.useState<Province[]>([]);
  const [municipality, setMunicipality] = React.useState<Municipality[]>([]);
  const [barangay, setBarangay] = React.useState<Barangay[]>([]);

  const fetchProvince = async () => {
    try {
      const data = await AddressService.getProvinces();
      if (Array.isArray(data)) {
        setProvince(data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchMunicipality = async (provinceId: number) => {
    try {
      const data = await AddressService.getMunicipalities(provinceId);
      if (Array.isArray(data)) {
        setMunicipality(data);
      }
    } catch (error) {
      console.error("Error fetching municipalities:", error);
    }
  };

  const fetchBarangay = async (municipalityId: number) => {
    try {
      const data = await AddressService.getBarangays(municipalityId);
      if (Array.isArray(data)) {
        setBarangay(data);
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  React.useEffect(() => {
    fetchProvince();
  }, []);

  React.useEffect(() => {
    if (addressData.province_id) {
      fetchMunicipality(addressData.province_id);
    }
  }, [addressData.province_id]);

  React.useEffect(() => {
    if (addressData.municipality_id) {
      fetchBarangay(addressData.municipality_id);
    }
  }, [addressData.municipality_id]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography.Header sx={{ mb: 1, color: colors.primary }}>
        Business Location
      </Typography.Header>
      <Typography.Body sx={{ mb: 4, color: colors.gray, fontSize: "0.95rem" }}>
        Where are you located
      </Typography.Body>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControl required>
          <Typography.Label>Street Address *</Typography.Label>
          <Input
            placeholder="123 Main Street, Suite 100"
            fullWidth
            value={data.address}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address: e.target.value }))
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
        </FormControl>

        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>City *</Typography.Label>
              <Select
                placeholder="Select city"
                value={addressData.municipality_id}
                onChange={(_, value) => {
                  setAddressData((prev) => ({
                    ...prev,
                    municipality_id: value as number,
                  }));
                }}
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              >
                {municipality.map((mun) => (
                  <Option key={mun.id} value={mun.id}>
                    {mun.municipality}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>State / Province *</Typography.Label>
              <Select
                placeholder="Select state..."
                value={addressData.province_id}
                onChange={(_, value) => {
                  setAddressData((prev) => ({
                    ...prev,
                    province_id: value as number,
                    municipality_id: 0,
                    barangay_id: 0,
                  }));
                  setMunicipality([]);
                  setBarangay([]);
                }}
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              >
                {province.map((prov) => (
                  <Option key={prov.id} value={prov.id}>
                    {prov.province}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <FormControl>
          <Typography.Label>Barangay</Typography.Label>
          <Select
            placeholder="Select barangay"
            value={addressData.barangay_id}
            onChange={(_, value) => {
              setAddressData((prev) => ({
                ...prev,
                barangay_id: value as number,
              }));
              setData((prev) => ({
                ...prev,
                barangay_id: value as number,
              }));
            }}
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          >
            {barangay.map((brgy) => (
              <Option key={brgy.id} value={brgy.id}>
                {brgy.barangay}
              </Option>
            ))}
          </Select>
        </FormControl>

        {/* Map Input */}
        <Box>
          <Typography.Label>Location Pin (Google Maps)</Typography.Label>
          <Typography.Body
            sx={{ fontSize: "0.8rem", color: colors.gray, mb: 1 }}
          >
            Click on the map to set your business location
          </Typography.Body>
          <Box
            sx={{
              border: `1px solid ${colors.tertiary}`,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <MapInput
              latitude={data.latitude}
              longitude={data.longitude}
              onChange={(lat: string, lng: string) => {
                setData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
              }}
              height={600}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Step3;
