import Text from "@/src/components/Text";
import Button from "@/src/components/Button";
import React from "react";
import type { Business } from "@/src/types/Business";
import Input from "@/src/components/Input";
import axios from "axios";

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
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text variant="header-title">Address Map Coordinates</Text>

        <div className="content">
          <Input
            type="select"
            label="Province"
            value={data.province_id}
            onChange={(e) => {
              const value = e.target.value;
              setData((prev) => ({
                ...prev,
                province_id: value,
              }));
              setSelectedProvince(value); // ✅ fetch municipalities for that province
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
                municipality_id: value,
              }));
              setSelectedMunicipality(value); // ✅ fetch barangays for that municipality
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
                barangay_id: value,
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
        <div style={{ display: "flex", gap: 400 }}>
          <Button onClick={onPrev} variant="secondary" style={{ flex: 1 }}>
            <Text variant="normal" color="white">
              Back
            </Text>
          </Button>
          <Button onClick={onNext} variant="primary" style={{ flex: 1 }}>
            <Text variant="normal" color="white">
              Next
            </Text>
          </Button>
        </div>
      </div>{" "}
    </>
  );
};

export default StepLocation;
