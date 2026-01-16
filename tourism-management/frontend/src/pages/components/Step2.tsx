import Typography from "@/src/components/Typography";
import type { Owner } from "@/src/types/Owner";
import type { User } from "@/src/types/User";
import type { Address } from "@/src/types/Address";
import { FormControl, Input, Box, Grid, Select, Option } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import React from "react";
import {
  AddressService,
  type Barangay,
  type Municipality,
  type Province,
} from "@/src/services/AddressService";

type Props = {
  userData: User;
  setUserData: React.Dispatch<React.SetStateAction<User>>;
  ownerData: Owner;
  setOwnerData: React.Dispatch<React.SetStateAction<Owner>>;
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
};

const Step2: React.FC<Props> = ({
  userData,
  setUserData,
  ownerData,
  setOwnerData,
  addressData,
  setAddressData,
}) => {
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [municipalities, setMunicipalities] = React.useState<Municipality[]>(
    []
  );
  const [barangays, setBarangays] = React.useState<Barangay[]>([]);

  const fetchProvinces = async () => {
    try {
      const data = await AddressService.getProvinces();
      if (Array.isArray(data)) {
        setProvinces(data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchMunicipalities = async (provinceId: number) => {
    try {
      const data = await AddressService.getMunicipalities(provinceId);
      if (Array.isArray(data)) {
        setMunicipalities(data);
      }
    } catch (error) {
      console.error("Error fetching municipalities:", error);
    }
  };

  const fetchBarangays = async (municipalityId: number) => {
    try {
      const data = await AddressService.getBarangays(municipalityId);
      if (Array.isArray(data)) {
        setBarangays(data);
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  React.useEffect(() => {
    fetchProvinces();
  }, []);

  React.useEffect(() => {
    if (addressData.province_id) {
      fetchMunicipalities(addressData.province_id);
    }
  }, [addressData.province_id]);

  React.useEffect(() => {
    if (addressData.municipality_id) {
      fetchBarangays(addressData.municipality_id);
    }
  }, [addressData.municipality_id]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography.Header sx={{ mb: 1, color: colors.primary }}>
        Owner Information
      </Typography.Header>
      <Typography.Body sx={{ mb: 4, color: colors.gray, fontSize: "0.95rem" }}>
        Your personal details
      </Typography.Body>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>First Name *</Typography.Label>
              <Input
                placeholder="John"
                fullWidth
                value={ownerData.first_name}
                onChange={(e) =>
                  setOwnerData({ ...ownerData, first_name: e.target.value })
                }
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              />
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>Last Name *</Typography.Label>
              <Input
                placeholder="Smith"
                fullWidth
                value={ownerData.last_name}
                onChange={(e) =>
                  setOwnerData({ ...ownerData, last_name: e.target.value })
                }
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              />
            </FormControl>
          </Grid>
        </Grid>

        <FormControl required>
          <Typography.Label>Email Address *</Typography.Label>
          <Input
            placeholder="john.smith@example.com"
            fullWidth
            type="email"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
        </FormControl>

        <FormControl required>
          <Typography.Label>Phone Number *</Typography.Label>
          <Input
            placeholder="(555) 123-4567"
            fullWidth
            value={userData.phone_number}
            onChange={(e) =>
              setUserData({ ...userData, phone_number: e.target.value })
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
          <Typography.Body
            sx={{ fontSize: "0.8rem", color: colors.gray, mt: 0.5 }}
          >
            Format: 09XXXXXXXXX
          </Typography.Body>
        </FormControl>

        <FormControl required>
          <Typography.Label>Gender *</Typography.Label>
          <Select
            placeholder="Select gender..."
            value={ownerData.gender || null}
            onChange={(_, value) =>
              setOwnerData({ ...ownerData, gender: value || "" })
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          >
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
            <Option value="Other">Other</Option>
          </Select>
        </FormControl>

        <FormControl required>
          <Typography.Label>Address *</Typography.Label>
          <Input
            placeholder="Street, Building, Unit Number"
            fullWidth
            value={ownerData.address || ""}
            onChange={(e) =>
              setOwnerData({ ...ownerData, address: e.target.value })
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
        </FormControl>

        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>Province *</Typography.Label>
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
                  setMunicipalities([]);
                  setBarangays([]);
                }}
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              >
                {provinces.map((prov) => (
                  <Option key={prov.id} value={prov.id.toString()}>
                    {prov.province}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>Municipality *</Typography.Label>
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
                  setBarangays([]);
                }}
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              >
                {municipalities.map((mun) => (
                  <Option key={mun.id} value={mun.id.toString()}>
                    {mun.municipality}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <FormControl required>
          <Typography.Label>Barangay *</Typography.Label>
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
              setUserData((prev) => ({
                ...prev,
                barangay_id: barangayId,
              }));
            }}
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          >
            {barangays.map((brgy) => (
              <Option key={brgy.id} value={brgy.id.toString()}>
                {brgy.barangay}
              </Option>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Step2;
