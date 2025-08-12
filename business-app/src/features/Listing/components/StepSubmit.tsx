import Text from "@/src/components/Text";
import Button from "@/src/components/Button";
import React from "react";
import type { Business } from "@/src/types/Business";
import axios from "axios";
import { useNavigate } from "react-router-dom";
type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepSubmit: React.FC<Props> = ({ onNext, onPrev, API_URL, data }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/business`, data);
      onNext();
      navigate("/request");
    } catch (err: any) {
      console.error("Error submitting business:", err);
      setError(
        err.response?.data?.error || "An error occurred while submitting."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text variant="header-title">Submit Listing</Text>

      {error && (
        <Text variant="normal" color="red">
          {error}
        </Text>
      )}

      <div style={{ display: "flex", gap: 400 }}>
        <Button onClick={onPrev} variant="secondary" style={{ flex: 1 }}>
          <Text variant="normal" color="white">
            Back
          </Text>
        </Button>

        <Button
          onClick={handleSubmit}
          variant="primary"
          style={{ flex: 1 }}
          disabled={loading}
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
