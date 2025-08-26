import React from "react";
import type { Business } from "@/src/types/Business";
import axios from "axios";
import CardHeader from "@/src/components/CardHeader";
import Container from "@/src/components/Container";
import { Button, FormControl, FormLabel, Grid, Input } from "@mui/joy";
import { Select, Option } from "@mui/joy";
import Label from "@/src/components/Label";
import Text from "@/src/components/Text";
import { colors } from "@/src/utils/Colors";
import { Add } from "@mui/icons-material";
import MapInput from "@/src/components/MapInput";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
};

const Step3: React.FC<Props> = ({ api, data, setData }) => {
  const [province, setProvince] = React.useState<
    { id: number; province: string }[]
  >([]);
  const [municipality, setMunicipality] = React.useState<
    { id: number; municipality: string }[]
  >([]);
  const [barangay, setBarangay] = React.useState<
    { id: number; barangay: string }[]
  >([]);

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
  }, []);

  React.useEffect(() => {
    if (data.province_id) {
      fetchMunicipality(data.province_id);
    }
  }, [data.province_id]);

  React.useEffect(() => {
    if (data.municipality_id) {
      fetchBarangay(data.municipality_id);
    }
  }, [data.municipality_id]);

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
    <div className="stepperContent">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <CardHeader
          title="Business Address and Location"
          color="white"
          margin="0 0 20px 0"
        />

        <Grid container columns={12}>
          <Grid xs={4}>
            <Container padding="0 20px " gap="20px">
              <FormControl required>
                <FormLabel>Province</FormLabel>
                <Select
                  size="md"
                  placeholder="-- Select a province --"
                  value={data.province_id?.toString() ?? ""}
                  onChange={(e, value) => {
                    if (!value) return;
                    const province_id = Number(value);
                    setData((prev) => ({
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

              <FormControl required>
                <FormLabel>Municipality</FormLabel>
                <Select
                  size="md"
                  placeholder="-- Select municipality --"
                  value={data.municipality_id?.toString() ?? ""}
                  onChange={(e, value) => {
                    if (!value) return;
                    const municipality_id = Number(value);
                    setData((prev) => ({
                      ...prev,
                      municipality_id: municipality_id,
                    }));
                  }}
                  disabled={!data.province_id}
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
                <FormLabel>Barangay</FormLabel>
                <Select
                  size="md"
                  placeholder="-- Select barangay --"
                  value={data.barangay_id?.toString() ?? ""}
                  onChange={(e, value) => {
                    if (!value) return;
                    const barangay_id = Number(value);
                    setData((prev) => ({
                      ...prev,
                      barangay_id: barangay_id,
                    }));
                  }}
                  disabled={!data.municipality_id}
                >
                  <Option value="">-- Select barangay --</Option>
                  {barangay.map((barangay) => (
                    <Option key={barangay.id} value={barangay.id.toString()}>
                      {barangay.barangay}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Container>
          </Grid>

          <Grid xs={8}>
            <Container padding="0 20px " gap="20px">
              <Container
                background={colors.secondary}
                elevation={2}
                padding="20px"
              >
                <Grid container spacing={2} columns={12}>
                  <Grid xs={8}>
                    <Text color="white" variant="card-title">
                      Map Coordinates
                    </Text>
                    <Text color="white" variant="card-sub-title">
                      Pin the location of your business in the map
                    </Text>
                  </Grid>
                  <Grid xs={4}>
                    <Button
                      fullWidth
                      variant="soft"
                      color="neutral"
                      size="sm"
                      startDecorator={<Add />}
                      style={{ height: "100%" }}
                      onClick={handleGetCurrentLocation}
                    >
                      Get Curreant Location
                    </Button>
                  </Grid>
                </Grid>
              </Container>
              <Container padding="0">
                <Grid container spacing={3} columns={12}>
                  <Grid xs={6}>
                    <FormControl required>
                      <FormLabel>Longitude</FormLabel>
                      <Input
                        variant="outlined"
                        size="md"
                        value={data.longitude}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            longitude: e.target.value,
                          }))
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={6}>
                    <FormControl required>
                      <FormLabel>Latitude</FormLabel>

                      <Input
                        variant="outlined"
                        size="md"
                        value={data.latitude}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            latitude: e.target.value,
                          }))
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <MapInput
                  latitude={data.latitude}
                  longitude={data.longitude}
                  onChange={(lat, lng) =>
                    setData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }))
                  }
                />
              </Container>
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Step3;
