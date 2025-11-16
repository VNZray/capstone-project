import Container from "@/src/components/Container";
import MapInput from "@/src/components/MapInput";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import api from "@/src/services/api";
import type {
  Address,
  Barangay,
  Municipality,
  Province,
} from "@/src/types/Address";
import type { Business } from "@/src/types/Business";
import { Add } from "@mui/icons-material";
import {
  Button,
  FormControl,
  FormLabel,
  Option,
  Select,
} from "@mui/joy";
import axios from "axios";
import React from "react";

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
      const response = await axios.get(`${api}/address/provinces`);
      if (Array.isArray(response.data)) {
        setProvince(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching business categories:", error);
    }
  };

  const fetchMunicipality = async (provinceId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/municipalities/${provinceId}`
      );

      if (Array.isArray(response.data)) {
        setMunicipality(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  const fetchBarangay = async (municipalityId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/barangays/${municipalityId}`
      );

      if (Array.isArray(response.data)) {
        setBarangay(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  React.useEffect(() => {
    fetchProvince();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (addressData.province_id) {
      fetchMunicipality(addressData.province_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressData.province_id]);

  React.useEffect(() => {
    if (addressData.municipality_id) {
      fetchBarangay(addressData.municipality_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressData.municipality_id]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();

        setData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Unable to retrieve your location. Please allow location access."
        );
      }
    );
  };

  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0">
        <Typography.CardTitle>
          Business Address
        </Typography.CardTitle>
        <Typography.CardSubTitle>
          Please provide your business information.
        </Typography.CardSubTitle>
      </Container>

      <Container>
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Select
            size="md"
            placeholder="-- Select a province --"
            value={addressData.province_id?.toString() ?? ""}
            onChange={(_e, value) => {
              if (!value) return;
              const province_id = Number(value);
              setAddressData((prev) => ({
                ...prev,
                province_id: province_id,
              }));
            }}
          >
            <Option value="">-- Select province --</Option>
            {province.map((province) => (
              <Option key={province.id} value={province.id.toString()}>
                {province.province}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Middle Name</FormLabel>
          <Select
            size="md"
            placeholder="-- Select municipality --"
            value={addressData.municipality_id?.toString() ?? ""}
            onChange={(_e, value) => {
              if (!value) return;
              const municipality_id = Number(value);
              setAddressData((prev) => ({
                ...prev,
                municipality_id: municipality_id,
              }));
            }}
            disabled={!addressData.province_id}
          >
            <Option value="">-- Select municipality --</Option>
            {municipality.map((municipality) => (
              <Option key={municipality.id} value={municipality.id.toString()}>
                {municipality.municipality}
              </Option>
            ))}
          </Select>{" "}
        </FormControl>

        <FormControl>
          <FormLabel>Last Name</FormLabel>
          <Select
            size="md"
            placeholder="-- Select barangay --"
            value={addressData.barangay_id?.toString() ?? ""}
            onChange={(_e, value) => {
              if (!value) return;
              const barangay_id = Number(value);
              setAddressData((prev) => ({
                ...prev,
                barangay_id: barangay_id,
              }));

              setData((prev) => ({
                ...prev,
                barangay_id: barangay_id,
              }));
            }}
            disabled={!addressData.municipality_id}
          >
            <Option value="">-- Select barangay --</Option>
            {barangay.map((barangay) => (
              <Option key={barangay.id} value={barangay.id.toString()}>
                {barangay.barangay}
              </Option>
            ))}
          </Select>
        </FormControl>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Button
            variant="soft"
            color="primary"
            size="md"
            startDecorator={<Add />}
            onClick={handleGetCurrentLocation}
            sx={{
              borderRadius: "8px",
              fontWeight: 500,
              mt: 1,
            }}
          >
            Get Current Location
          </Button>

          {/* Map Section - Right Side */}
          <div style={{ marginTop: "16px" }}>
            <MapInput
              latitude={data.latitude}
              longitude={data.longitude}
              height={"clamp(260px, 34vh, 360px)"}
              onChange={(lat, lng) =>
                setData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }))
              }
            />
            {/* Coordinate readout (subtle) */}
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 12,
                color: "#6b7280",
                fontSize: 12,
              }}
            >
              <span>
                Lat:{" "}
                <span style={{ color: "#111827", fontWeight: 600 }}>
                  {data.latitude || "-"}
                </span>
              </span>
              <span>
                Lng:{" "}
                <span style={{ color: "#111827", fontWeight: 600 }}>
                  {data.longitude || "-"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </Container>
    </PageContainer>
  );
};

export default Step3;
