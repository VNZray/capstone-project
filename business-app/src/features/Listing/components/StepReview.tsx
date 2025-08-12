import Text from "@/src/components/Text";
import Button from "@/src/components/Button";
import React from "react";
import type { Business } from "@/src/types/Business";
import axios from "axios";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepReview: React.FC<Props> = ({ onNext, onPrev, data, API_URL }) => {
  const [businessTypes, setBusinessTypes] = React.useState<
    { id: number; type: string }[]
  >([]);
  const [businessCategories, setBusinessCategories] = React.useState<
    { id: number; category: string }[]
  >([]);

  const fetchBusinessCategory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/category-and-type/business-category`
      );
      if (Array.isArray(response.data)) {
        setBusinessCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching business categories:", error);
    }
  };

  const fetchBusinessTypes = async (categoryId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/category-and-type/type/${categoryId}`
      );
      if (Array.isArray(response.data)) {
        setBusinessTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

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

  const getCategoryName = (id: string | number) =>
    businessCategories.find((c) => c.id.toString() === id?.toString())
      ?.category || "-";

  const getTypeName = (id: string | number) =>
    businessTypes.find((t) => t.id.toString() === id?.toString())?.type || "-";

  const getProvince = (id: string | number) =>
    province.find((p) => p.id.toString() === id?.toString())?.province || "-";

  const getMunicipality = (id: string | number) =>
    municipality.find((m) => m.id.toString() === id?.toString())
      ?.municipality || "-";

  const getBarangay = (id: string | number) =>
    barangay.find((b) => b.id.toString() === id?.toString())?.barangay || "-";

  React.useEffect(() => {
    fetchBusinessCategory();

    if (data.business_category_id) {
      fetchBusinessTypes(data.business_category_id.toString());
    }

    fetchProvince();

    if (selectedProvince) {
      fetchMunicipality(selectedProvince);
    }

    if (selectedMunicipality) {
      fetchBarangay(selectedMunicipality);
    }
  }, []);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number;
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <Text variant="medium" color="dark">
        {label}
      </Text>
      <Text variant="normal" color="dark">
        {value || "-"}
      </Text>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Text variant="header-title">Review Your Information</Text>
      <Text variant="normal" color="dark">
        Please check that all details are correct before proceeding.
      </Text>

      {/* BASIC INFO */}
      <section style={{ background: "#fafafa", borderRadius: 8 }}>
        <Text variant="bold" color="dark">
          Basic Information
        </Text>
        <InfoRow label="Business Name" value={data.business_name} />
        <InfoRow
          label="Category"
          value={getCategoryName(data.business_category_id)}
        />
        <InfoRow label="Type" value={getTypeName(data.business_type_id)} />
      </section>

      {/* CONTACT */}
      <section style={{ background: "#fafafa", borderRadius: 8 }}>
        <Text variant="bold" color="dark">
          Contact Information
        </Text>
        <InfoRow label="Phone" value={data.phone_number} />
        <InfoRow label="Email" value={data.email} />
      </section>

      {/* LOCATION */}
      <section style={{ background: "#fafafa", borderRadius: 8 }}>
        <Text variant="bold" color="dark">
          Location
        </Text>
        <InfoRow label="Province" value={getProvince(data.province_id)} />
        <InfoRow
          label="Municipality"
          value={getMunicipality(data.municipality_id)}
        />
        <InfoRow label="Barangay" value={getBarangay(data.barangay_id)} />

        <InfoRow label="Latitude" value={data.latitude} />
        <InfoRow label="Longitude" value={data.longitude} />
      </section>

      {/* DESCRIPTION */}
      <section style={{ background: "#fafafa", borderRadius: 8 }}>
        <Text variant="bold" color="dark">
          Description
        </Text>
        <Text variant="medium" color="dark">
          {data.description || "-"}
        </Text>
      </section>

      {/* LINKS */}
      <section style={{ background: "#fafafa", borderRadius: 8 }}>
        <Text variant="bold" color="dark">
          Links
        </Text>
        <InfoRow label="Facebook" value={data.facebook_url} />
        <InfoRow label="Instagram" value={data.instagram_url} />
        <InfoRow label="TikTok" value={data.tiktok_url} />
      </section>

      {/* PRICING */}
      <section style={{ background: "#fafafa", borderRadius: 8 }}>
        <Text variant="bold" color="dark">
          Pricing
        </Text>
        <InfoRow label="Min Price" value={data.min_price} />
        <InfoRow label="Max Price" value={data.max_price} />
      </section>

      <div style={{ display: "flex", gap: 20 }}>
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
    </div>
  );
};

export default StepReview;
