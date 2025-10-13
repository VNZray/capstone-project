import React from "react";
import type { Business } from "@/src/types/Business";
import axios from "axios";
import { Button, FormControl, FormLabel } from "@mui/joy";
import { Select, Option } from "@mui/joy";
import Text from "@/src/components/Text";
import { Add } from "@mui/icons-material";
import MapInput from "@/src/components/MapInput";
import type {
  Address,
  Barangay,
  Municipality,
  Province,
} from "@/src/types/Address";

type Props = {
  data: Business;
  addressData: Address;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
  api: string;
};

const Step3: React.FC<Props> = ({
  api,
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
          /* Force reliable 2-column layout for Step 3 */
          .twoCol {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            align-items: start;
          }
          @media (min-width: 640px) {
            .twoCol { grid-template-columns: 1fr 1fr; }
          }
          .twoCol .col { padding: 0 8px; }
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
            gap: 20,
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              paddingBottom: 8,
              textAlign: "center",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: 16,
              paddingTop: 4,
            }}
          >
            <Text
              variant="label"
              color="gray"
              style={{
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.3,
                display: "block",
                marginBottom: 8,
                color: "#111827",
              }}
            >
              Business Address and Location
            </Text>
            <Text
              color="gray"
              style={{
                fontSize: 15,
                fontWeight: 400,
                opacity: 0.75,
                display: "block",
                maxWidth: "500px",
                margin: "0 auto",
                color: "#6b7280",
              }}
            >
              Where is your business located?
            </Text>
          </div>

          <div className="twoCol">
            <div className="col">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                      "--Select-focusedThickness": "2px",
                      "--Select-focusedHighlight":
                        "var(--joy-palette-primary-500)",
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
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Municipality
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
                      "--Select-focusedThickness": "2px",
                      "--Select-focusedHighlight":
                        "var(--joy-palette-primary-500)",
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
                      mb: 0.75,
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
                      "--Select-focusedThickness": "2px",
                      "--Select-focusedHighlight":
                        "var(--joy-palette-primary-500)",
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
            </div>

            <div className="col">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step3;
