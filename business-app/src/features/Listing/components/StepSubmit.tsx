import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Text from "@/src/components/Text";
import Button from "@mui/joy/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";
import { PostAdd } from "@mui/icons-material";

type BookingSite = {
  name: string;
  link: string;
  business_id?: string;
};

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  onNext: () => void;
  onPrev: () => void;
  bookingSite: BookingSite[];
};

const StepSubmit: React.FC<Props> = ({ onPrev, api, data, bookingSite }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create business
      const businessRes = await axios.post(`${api}/business`, data);
      const businessId = businessRes.data.data.id;

      // 2. Insert booking sites if any exist
      if (bookingSite?.length > 0) {
        const validSites = bookingSite
          .filter((site) => site.name && site.link)
          .map((site) => ({ ...site, business_id: businessId }));

        await Promise.all(
          validSites.map((site) => axios.post(`${api}/external-booking`, site))
        );
      }

      // 3. Navigate forward
      navigate("/request");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred while submitting."
      );
    } finally {
      setLoading(false);
    }
  };

  // InfoRow component for consistent display
  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 6,
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
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <CardHeader
            title="Final Review & Submit"
            color="white"
            margin="0 0 20px 0"
          />
        </div>
        <Text variant="normal" color="dark" style={{ marginBottom: 12 }}>
          Please review the summary of your business listing before submission.
          Once submitted, changes may require admin approval.
        </Text>
        {/* Business Summary */}
        <div>
          <CardHeader
            title="Business Summary"
            bg="tab-background"
            color="dark"
            variant="medium"
            height="10px"
          />
        </div>{" "}
        <section
          style={{ background: "#fafafa", borderRadius: 8, padding: 12 }}
        >
          <InfoRow label="Business Name" value={data.business_name} />
          <InfoRow
            label="Booking Feature"
            value={data.hasBooking ? "Yes" : "No"}
          />
          <InfoRow label="Phone" value={data.phone_number} />
          <InfoRow label="Email" value={data.email} />
        </section>
        {/* External Booking Sites */}
        {data.hasBooking && bookingSite?.length > 0 && (
          <>
            <CardHeader
              title="External Booking Sites"
              bg="tab-background"
              color="dark"
              variant="medium"
              height="10px"
              style={{ marginTop: 12 }}
            />
            <section
              style={{ background: "#fafafa", borderRadius: 8, padding: 12 }}
            >
              {bookingSite.map((site, index) => (
                <InfoRow
                  key={index}
                  label={site.name || `Booking Site ${index + 1}`}
                  value={site.link || "-"}
                />
              ))}
            </section>
          </>
        )}
        {error && (
          <Text variant="normal" color="red" style={{ marginTop: 12 }}>
            {error}
          </Text>
        )}
      </div>
      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: 300, marginTop: 20 }}>
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
          startDecorator={<PostAdd />}
          onClick={handleSubmit}
          style={{ flex: 1 }}
          size="lg"
        >
          <Text variant="normal" color="white">
            {loading ? "Submitting..." : "Submit"}
          </Text>
        </Button>
      </div>
    </div>
  );
};

export default StepSubmit;
