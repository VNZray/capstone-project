import Text from "@/src/components/Text";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React from "react";
import type { Business } from "@/src/types/Business";
import Input from "@/src/components/Input";
import CardHeader from "@/src/components/CardHeader";
import { AddBox } from "@mui/icons-material";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
  bookingSite: BookingSite[];
  setBookingSites: React.Dispatch<React.SetStateAction<BookingSite[]>>;
};

type BookingSite = {
  name: string;
  link: string;
};

const bookingSiteOptions = [
  "Agoda",
  "Trivago",
  "Booking.com",
  "Airbnb",
  "Hotels.com",
  "Expedia",
  "TripAdvisor",
  "Kayak",
  "Other",
];

const StepLinks: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  setBookingSites,
  data,
  setData,
  bookingSite,
}) => {
  const [useBookingFeature, setUseBookingFeature] = React.useState(true); // default ON
  const [site, setSite] = React.useState<{ name: string; link: string }[]>([]);

  const addBookingSite = () => {
    setBookingSites((prev) => [...prev, { name: "", link: "" }]);
  };

  return (
    <div className="stepperContent">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflowY: "auto",
        }}
      >
        <CardHeader
          title="Social Media Links"
          color="white"
          margin="0 0 20px 0"
        />

        <div className="content">
          <div>
            <CardHeader
              bg="tab-background"
              height="10px"
              variant="medium"
              color="dark"
              title="Social Media Links"
            />
          </div>
          <Input
            type="text"
            label="Facebook"
            placeholder="Enter Facebook page URL"
            value={data.facebook_url}
            onChange={(e) =>
              setData((prev) => ({ ...prev, facebook_url: e.target.value }))
            }
          />

          <Input
            type="text"
            label="Instagram"
            placeholder="Enter Instagram profile URL"
            value={data.instagram_url}
            onChange={(e) =>
              setData((prev) => ({ ...prev, instagram_url: e.target.value }))
            }
          />

          <Input
            type="text"
            label="Tiktok"
            placeholder="Enter TikTok profile URL"
            value={data.tiktok_url}
            onChange={(e) =>
              setData((prev) => ({ ...prev, tiktok_url: e.target.value }))
            }
          />
        </div>

        {/* Booking Feature Switch */}
        <div style={{ marginTop: 20 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="card-title">Use booking feature?</Text>
            <label className="switch">
              <input
                type="checkbox"
                checked={data.hasBooking}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    hasBooking: e.target.checked, // ✅ true if checked
                  }))
                }
              />
              <span className="slider round"></span>
            </label>
          </label>
        </div>

        {/* Show booking links only if switch is ON */}
        {data.hasBooking && (
          <>
            {bookingSite.map((s, id) => (
              <div key={id}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: 12,
                  }}
                >
                  <Input
                    type="select"
                    label="Booking Sites"
                    value={s.name}
                    onChange={(e) => {
                      const newSites = [...bookingSite];
                      newSites[id].name = String(e.target.value);
                      setBookingSites(newSites);
                    }}
                    options={[
                      { value: "", label: "-- Select --" },
                      ...bookingSiteOptions.map((siteName) => ({
                        value: siteName,
                        label: siteName,
                      })),
                    ]}
                  />
                  <Input
                    type="text"
                    label="Link"
                    value={s.link}
                    onChange={(e) => {
                      const newSites = [...bookingSite];
                      newSites[id].link = e.target.value;
                      setBookingSites(newSites);
                    }}
                  />
                </div>
              </div>
            ))}

            <Button
              variant="contained"
              endIcon={<AddBox />}
              onClick={onNext}
              style={{ flex: 1 }}
            >
              Add
            </Button>
          </>
        )}
      </div>
      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: 300, marginTop: 20 }}>
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

export default StepLinks;
