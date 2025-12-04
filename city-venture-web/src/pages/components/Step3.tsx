import Container from "@/src/components/Container";
import MapInput from "@/src/components/MapInput";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import { AddressService } from "@/src/services/AddressService";
import type {
  Address,
  Barangay,
  Municipality,
  Province,
} from "@/src/types/Address";
import type { Business } from "@/src/types/Business";
import {
  Button,
  FormControl,
  FormLabel,
  Option,
  Select,
  Card,
  Textarea,
} from "@mui/joy";
import { MapPin, Navigation, Home } from "lucide-react";
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
      const data = await AddressService.getProvinces();
      if (Array.isArray(data)) {
        setProvince(data);
        console.log(data);
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
        console.log(data);
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
        console.log(data);
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
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
      {/* Header Section */}
      <Card
        variant="soft"
        sx={{
          background: "linear-gradient(135deg, #0A1B47 0%, #0077B6 100%)",
          color: "white",
          border: "none",
          p: 3,
          mb: 3,
        }}
      >
        <Typography.CardTitle sx={{ color: "white", mb: 1 }}>
          Business Address
        </Typography.CardTitle>
        <Typography.CardSubTitle sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
          Where can customers find your business?
        </Typography.CardSubTitle>
      </Card>

      <Container>
        {/* Full Address Field */}
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: "12px" }}>
          <Typography.Label
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
            }}
          >
            <Home size={20} />
            Complete Address
          </Typography.Label>

          <FormControl required>
            <FormLabel
              sx={{
                mb: 1,
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Street Address (House No., Street, Subdivision)
            </FormLabel>
            <Textarea
              placeholder="e.g., Unit 123, Rizal Street, Green Valley Subdivision"
              value={data.address}
              onChange={(e) =>
                setData((prev) => ({ ...prev, address: e.target.value }))
              }
              minRows={2}
              sx={{
                borderRadius: "8px",
                fontSize: "0.9375rem",
              }}
            />
          </FormControl>
        </Card>

        {/* Location Selection */}
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: "12px" }}>
          <Typography.Label
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
            }}
          >
            <MapPin size={20} />
            Location Details
          </Typography.Label>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <FormControl required>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Province
              </FormLabel>
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
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
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

            <FormControl required>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Municipality/City
              </FormLabel>
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
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                }}
              >
                <Option value="">-- Select municipality --</Option>
                {municipality.map((municipality) => (
                  <Option
                    key={municipality.id}
                    value={municipality.id.toString()}
                  >
                    {municipality.municipality}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl required>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Barangay
              </FormLabel>
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
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                }}
              >
                <Option value="">-- Select barangay --</Option>
                {barangay.map((barangay) => (
                  <Option key={barangay.id} value={barangay.id.toString()}>
                    {barangay.barangay}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </div>
        </Card>

        {/* Map Section */}
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Typography.Label
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 600,
              }}
            >
              <Navigation size={20} />
              Pin Your Location
            </Typography.Label>

            <Button
              variant="soft"
              color="primary"
              size="sm"
              startDecorator={<Navigation size={16} />}
              onClick={handleGetCurrentLocation}
              sx={{
                borderRadius: "8px",
                fontWeight: 500,
              }}
            >
              Use Current Location
            </Button>
          </div>

          <MapInput
            latitude={data.latitude}
            longitude={data.longitude}
            height={"clamp(300px, 40vh, 450px)"}
            onChange={(lat, lng) =>
              setData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
              }))
            }
          />

          {/* Coordinate Display */}
          <div
            style={{
              marginTop: 12,
              padding: "12px 16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              display: "flex",
              gap: 24,
              fontSize: "0.875rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{ color: "#6b7280", marginRight: 8 }}>
                Latitude:
              </span>
              <span style={{ color: "#111827", fontWeight: 600 }}>
                {data.latitude || "Not set"}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ color: "#6b7280", marginRight: 8 }}>
                Longitude:
              </span>
              <span style={{ color: "#111827", fontWeight: 600 }}>
                {data.longitude || "Not set"}
              </span>
            </div>
          </div>
        </Card>
      </Container>
    </PageContainer>
  );
};

export default Step3;
