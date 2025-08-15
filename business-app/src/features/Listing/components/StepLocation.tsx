import Text from "@/src/components/Text";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";import React from "react";
import type { Business } from "@/src/types/Business";
import Input from "@/src/components/Input";
import axios from "axios";
import CardHeader from "@/src/components/CardHeader";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepLocation: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  data,
  setData,
}) => {
  const [province, setProvince] = React.useState<
    { id: number; province: string }[]
  >([]);
  const [municipality, setMunicipality] = React.useState<
    { id: number; municipality: string }[]
  >([]);
  const [barangay, setBarangay] = React.useState<
    { id: number; barangay: string }[]
  >([]);

  const [selectedProvince, setSelectedProvince] = React.useState("");
  const [selectedMunicipality, setSelectedMunicipality] = React.useState("");

  const fetchProvince = async () => {
    try {
      const response = await axios.get(`${API_URL}/address/provinces`);
      if (Array.isArray(response.data)) {
        setProvince(response.data);
      }
    } catch (error) {
      console.error("Error fetching business categories:", error);
    }
  };

  const fetchMunicipality = async (provinceId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/address/municipalities/${provinceId}`
      );

      if (Array.isArray(response.data)) {
        setMunicipality(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  const fetchBarangay = async (municipalityId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/address/barangays/${municipalityId}`
      );

      if (Array.isArray(response.data)) {
        setBarangay(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  React.useEffect(() => {
    fetchProvince();
  }, []);

  React.useEffect(() => {
    if (selectedProvince) {
      fetchMunicipality(selectedProvince);
    }

    if (selectedMunicipality) {
      fetchBarangay(selectedMunicipality);
    }
  }, [selectedProvince, selectedMunicipality]);

  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader title="Business Address and Location" color="white" margin="0 0 20px 0" />

        <div className="content">
          <div>
            <CardHeader
              bg="tab-background"
              height="10px"
              variant="medium"
              color="dark"
              title="Business Address"
            />
          </div>
          <Input
            type="select"
            label="Province"
            value={data.province_id}
            onChange={(e) => {
              const value = e.target.value;
              setData((prev) => ({
                ...prev,
                province_id: value.toString(),
              }));
              setSelectedProvince(value.toString()); // ✅ fetch municipalities for that province
            }}
            options={[
              { value: "", label: "-- Select a province --" },
              ...province.map((province) => ({
                value: province.id.toString(),
                label: province.province,
              })),
            ]}
          />

          <Input
            type="select"
            label="Municipality"
            value={data.municipality_id}
            onChange={(e) => {
              const value = e.target.value;
              setData((prev) => ({
                ...prev,
                municipality_id: value.toString(),
              }));
              setSelectedMunicipality(value.toString()); // ✅ fetch barangays for that municipality
            }}
            options={[
              { value: "", label: "-- Select a municipality --" },
              ...municipality.map((municipality) => ({
                value: municipality.id.toString(),
                label: municipality.municipality,
              })),
            ]}
          />

          <Input
            type="select"
            label="Barangay"
            value={data.barangay_id}
            onChange={(e) => {
              const value = e.target.value;
              setData((prev) => ({
                ...prev,
                barangay_id: value.toString(),
              }));
            }}
            options={[
              { value: "", label: "-- Select a barangay --" },
              ...barangay.map((barangay) => ({
                value: barangay.id.toString(),
                label: barangay.barangay,
              })),
            ]}
          />

          <div>
            <CardHeader
              bg="tab-background"
              height="10px"
              variant="medium"
              color="dark"
              title="Map Coordinates"
            />
          </div>

          <Input
            type="text"
            label="Latitude"
            placeholder="Enter latitude"
            value={data.latitude}
            onChange={(e) =>
              setData((prev) => ({ ...prev, latitude: e.target.value }))
            }
          />

          <Input
            type="text"
            label="Longitude"
            placeholder="Enter longitude"
            value={data.longitude}
            onChange={(e) =>
              setData((prev) => ({ ...prev, longitude: e.target.value }))
            }
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 300 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onPrev}
          style={{ flex: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          style={{ flex: 1 }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepLocation;
