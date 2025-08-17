import Text from "@/src/components/Text";
import Button from "@mui/joy/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React from "react";
import type { Business } from "@/src/types/Business";
import axios from "axios";
import CardHeader from "@/src/components/CardHeader";
import { useAddress } from "@/src/hooks/useAddress";
import { useCategoryAndType } from "@/src/hooks/useCategoryAndType";
type BookingSite = {
  name: string;
  link: string;
};

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  bookingSite: BookingSite[]; // ✅ New prop
  onNext: () => void;
  onPrev: () => void;
};

const StepReview: React.FC<Props> = ({
  onNext,
  onPrev,
  data,
  api,
  bookingSite,
}) => {
  const { address } = useAddress(data?.barangay_id);
  const { categoryAndType } = useCategoryAndType(data?.business_type_id);

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
          overflowX: "hidden",
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
          <InfoRow label="Category" value={categoryAndType?.category_name} />
          <InfoRow label="Type" value={categoryAndType?.type_name} />
          <InfoRow label="Profile" value={data.business_image} />
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
          <InfoRow label="Province" value={address?.province_name} />
          <InfoRow label="Municipality" value={address?.municipality_name} />
          <InfoRow label="Barangay" value={address?.barangay_name} />
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
              {!data.hasBooking &&
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
        <Button
          color="neutral"
          startDecorator={<ArrowBackIcon />}
          onClick={onPrev}
          style={{ flex: 1 }}
          size="lg"
        >
          Back
        </Button>
        <Button
          endDecorator={<ArrowForwardIcon />}
          onClick={onNext}
          style={{ flex: 1 }}
          size="lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
