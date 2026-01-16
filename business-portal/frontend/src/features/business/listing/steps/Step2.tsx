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
import {
  FormControl,
  Input,
  Box,
  Grid,
  Select,
  Option,
  FormLabel,
} from "@mui/joy";
import React from "react";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
};

const Step2: React.FC<Props> = ({
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

  const inputSx = {
    "--Input-focusedThickness": "2px",
    "--Input-focusedHighlight": "var(--joy-palette-primary-500)",
    backgroundColor: "#fafafa",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#ffffff",
      borderColor: "#d0d0d0",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    },
    "&:focus-within": {
      backgroundColor: "#ffffff",
      borderColor: "var(--joy-palette-primary-500)",
      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
    },
  };

  const selectSx = {
    "--Select-focusedThickness": "2px",
    "--Select-focusedHighlight": "var(--joy-palette-primary-500)",
    backgroundColor: "#fafafa",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#ffffff",
      borderColor: "#d0d0d0",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    },
    "&:focus-within": {
      backgroundColor: "#ffffff",
      borderColor: "var(--joy-palette-primary-500)",
      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
    },
  };

  return (
    <>
      <style>
        {`
          .br-section {
            box-shadow: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .stepperContent {
            background: transparent;
          }
        `}
      </style>
      <div
        className="stepperContent"
        style={{
          overflow: "auto",
          overflowX: "hidden",
          padding: "16px 16px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              paddingBottom: 12,
              textAlign: "center",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: 20,
              paddingTop: 4,
            }}
          >
            <Typography.Label size="lg" sx={{ mb: 1, color: "#111827" }}>
              Business Location
            </Typography.Label>
            <Typography.Body size="xs" sx={{ color: "#6b7280" }}>
              Where is your business located?
            </Typography.Body>
          </div>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl required>
              <FormLabel
                sx={{
                  mb: 0.75,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Street Address
              </FormLabel>
              <Input
                placeholder="123 Main Street, Suite 100"
                fullWidth
                value={data.address}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, address: e.target.value }))
                }
                sx={inputSx}
              />
            </FormControl>

            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <FormControl required>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Province
                  </FormLabel>
                  <Select
                    placeholder="Select province..."
                    value={addressData.province_id?.toString() || null}
                    onChange={(_, value) => {
                      const provinceId = value ? Number(value) : undefined;
                      setAddressData((prev) => ({
                        ...prev,
                        province_id: provinceId,
                        municipality_id: undefined,
                        barangay_id: undefined,
                      }));
                      setMunicipality([]);
                      setBarangay([]);
                    }}
                    sx={selectSx}
                  >
                    {province.map((prov) => (
                      <Option key={prov.id} value={prov.id.toString()}>
                        {prov.province}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={4}>
                <FormControl required>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Municipality
                  </FormLabel>
                  <Select
                    placeholder="Select municipality..."
                    disabled={!addressData.province_id}
                    value={addressData.municipality_id?.toString() || null}
                    onChange={(_, value) => {
                      const municipalityId = value ? Number(value) : undefined;
                      setAddressData((prev) => ({
                        ...prev,
                        municipality_id: municipalityId,
                        barangay_id: undefined,
                      }));
                      setBarangay([]);
                    }}
                    sx={selectSx}
                  >
                    {municipality.map((mun) => (
                      <Option key={mun.id} value={mun.id.toString()}>
                        {mun.municipality}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} md={4}>
                <FormControl required>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Barangay
                  </FormLabel>
                  <Select
                    placeholder="Select barangay..."
                    disabled={!addressData.municipality_id}
                    value={addressData.barangay_id?.toString() || null}
                    onChange={(_, value) => {
                      const barangayId = value ? Number(value) : undefined;
                      setAddressData((prev) => ({
                        ...prev,
                        barangay_id: barangayId,
                      }));
                      // Only update business data when barangayId is a valid number
                      if (typeof barangayId === "number") {
                        setData((prev) => ({
                          ...prev,
                          barangay_id: barangayId,
                        }));
                      }
                    }}
                    sx={selectSx}
                  >
                    {barangay.map((brgy) => (
                      <Option key={brgy.id} value={brgy.id.toString()}>
                        {brgy.barangay}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl>
              <FormLabel
                sx={{
                  mb: 0.75,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Map Location (Optional)
              </FormLabel>
              <Typography.Body size="xs" sx={{ color: "#6b7280", mb: 1 }}>
                Pin your business location on the map
              </Typography.Body>
              <MapInput
                latitude={data.latitude ? parseFloat(data.latitude) : undefined}
                longitude={
                  data.longitude ? parseFloat(data.longitude) : undefined
                }
                onChange={(lat, lng) => {
                  setData((prev) => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                  }));
                }}
                height={600}
              />
            </FormControl>
          </Box>
        </div>
      </div>
    </>
  );
};

export default Step2;
