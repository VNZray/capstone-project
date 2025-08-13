import Text from "@/src/components/Text";
import Button from "@/src/components/Button";
import React from "react";
import type { Business } from "@/src/types/Business";
import axios from "axios";
import CardHeader from "@/src/components/CardHeader";

type BookingSite = {
  name: string;
  link: string;
};

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  bookingSite: BookingSite[]; // ✅ New prop
  onNext: () => void;
  onPrev: () => void;
};

const StepReview: React.FC<Props> = ({
  onNext,
  onPrev,
  data,
  API_URL,
  bookingSite,
}) => {
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

  const fetchProvince = async () => {
    try {
      const response = await axios.get(`${API_URL}/address/provinces`);
      if (Array.isArray(response.data)) {
        setProvince(response.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
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
      console.error("Error fetching municipalities:", error);
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
      console.error("Error fetching barangays:", error);
    }
  };

  const getCategoryName = (id: string | number) =>
    businessCategories.find((c) => c.id.toString() === id?.toString())
      ?.category || "-";

  const getTypeName = (id: string | number) =>
    businessTypes.find((t) => t.id.toString() === id?.toString())?.type || "-";

  const getProvinceName = (id: string | number) =>
    province.find((p) => p.id.toString() === id?.toString())?.province || "-";

  const getMunicipalityName = (id: string | number) =>
    municipality.find((m) => m.id.toString() === id?.toString())
      ?.municipality || "-";

  const getBarangayName = (id: string | number) =>
    barangay.find((b) => b.id.toString() === id?.toString())?.barangay || "-";

  React.useEffect(() => {
    fetchBusinessCategory();
    if (data.business_category_id) {
      fetchBusinessTypes(data.business_category_id.toString());
    }
    fetchProvince();
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
    <div className="stepperContent">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          overflowY: "auto",
          paddingRight: 8,
        }}
      >
        <CardHeader
          title="Review Your Information"
          color="white"
          margin="0 0 20px 0"
        />

        <Text variant="normal" color="dark">
          Please check that all details are correct before proceeding.
        </Text>

        {/* BASIC INFO */}
        <CardHeader
          bg="tab-background"
          height="10px"
          variant="medium"
          color="dark"
          title="Basic Information"
        />

        <section
          style={{
            background: "#fafafa",
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <InfoRow label="Business Name" value={data.business_name} />
          <InfoRow
            label="Category"
            value={getCategoryName(data.business_category_id)}
          />
          <InfoRow label="Type" value={getTypeName(data.business_type_id)} />
          <InfoRow label="Profile" value={getTypeName(data.business_image)} />
        </section>

        {/* CONTACT */}
        <CardHeader
          bg="tab-background"
          height="10px"
          variant="medium"
          color="dark"
          title="Contact Information"
        />

        <section
          style={{
            background: "#fafafa",
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <InfoRow label="Phone" value={data.phone_number} />
          <InfoRow label="Email" value={data.email} />
        </section>

        {/* LOCATION */}
        <CardHeader
          bg="tab-background"
          height="10px"
          variant="medium"
          color="dark"
          title="Location"
        />
        <section
          style={{
            background: "#fafafa",
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <InfoRow label="Province" value={getProvinceName(data.province_id)} />
          <InfoRow
            label="Municipality"
            value={getMunicipalityName(data.municipality_id)}
          />
          <InfoRow label="Barangay" value={getBarangayName(data.barangay_id)} />
          <InfoRow label="Latitude" value={data.latitude} />
          <InfoRow label="Longitude" value={data.longitude} />
        </section>

        {/* DESCRIPTION */}
        <CardHeader
          bg="tab-background"
          height="10px"
          variant="medium"
          color="dark"
          title="Business Description"
        />
        <section
          style={{
            background: "#fafafa",
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <InfoRow label="Description" value={data.description} />
        </section>

        {/* LINKS */}
        <CardHeader
          bg="tab-background"
          height="10px"
          variant="medium"
          color="dark"
          title="Links"
        />
        <section
          style={{
            background: "#fafafa",
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <InfoRow label="Facebook" value={data.facebook_url} />
          <InfoRow label="Instagram" value={data.instagram_url} />
          <InfoRow label="TikTok" value={data.tiktok_url} />
        </section>

        {/* PRICING */}
        <CardHeader
          bg="tab-background"
          height="10px"
          variant="medium"
          color="dark"
          title="Pricing"
        />
        <section
          style={{
            background: "#fafafa",
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <InfoRow label="Min Price" value={data.min_price} />
          <InfoRow label="Max Price" value={data.max_price} />
        </section>

        {/* EXTERNAL BOOKINGS */}

        {bookingSite && bookingSite.length > 0 && (
          <div>
            <CardHeader
              bg="tab-background"
              height="10px"
              variant="medium"
              color="dark"
              title="External Booking Sites"
            />
            <section
              style={{
                background: "#fafafa",
                borderRadius: 8,
                paddingRight: 12,
                paddingLeft: 12,
              }}
            >
              <InfoRow
                label="Has Booking Feature"
                value={data.hasBooking ? "Yes" : "No"}
              />
              {data.hasBooking &&
                bookingSite.map((site, index) => (
                  <InfoRow
                    key={index}
                    label={site.name || `Booking Site ${index + 1}`}
                    value={site.link || "-"}
                  />
                ))}
            </section>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div style={{ display: "flex", gap: 300, marginTop: 16 }}>
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
