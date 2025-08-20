import Text from "@/src/components/Text";
import Button from "@mui/joy/Button";
import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";
import { AddBox, Language, EventAvailable } from "@mui/icons-material";
import { FormControl, Grid, Input, Select, Option } from "@mui/joy";
import Container from "@/src/components/Container";
import Label from "@/src/components/Label";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Facebook, Instagram, X } from "@mui/icons-material";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;

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

const bookingFeatures = ["External Booking", "Integrated Booking"];

const Step4: React.FC<Props> = ({
  setBookingSites,
  data,
  setData,
  bookingSite,
}) => {
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
          title="Social Media & Booking"
          color="white"
          margin="0 0 20px 0"
        />

        <Grid container columns={12}>
          {/* Social Media Links */}
          <Grid xs={4}>
            <Container padding="0 20px " gap="20px">
              {[
                {
                  platform: "Facebook",
                  icon: <Facebook sx={{ color: "#1877f2" }} />,
                },
                {
                  platform: "Instagram",
                  icon: <Instagram sx={{ color: "#E1306C" }} />,
                },
                {
                  platform: "TikTok",
                  icon: <X sx={{ color: "#000" }} />,
                },
              ].map(({ platform, icon }) => (
                <FormControl key={platform}>
                  <Label margin="0 0 5px 0">
                    <Text variant="medium">{platform}</Text>
                  </Label>
                  <Input
                    variant="outlined"
                    size="lg"
                    startDecorator={icon}
                    value={(data as any)[`${platform.toLowerCase()}_url`] || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        [`${platform.toLowerCase()}_url`]: e.target.value,
                      }))
                    }
                    placeholder={`https://${platform.toLowerCase()}.com/yourpage`}
                    sx={{
                      borderRadius: "12px",
                      "& input": { pl: 1 }, // space after icon
                    }}
                  />
                </FormControl>
              ))}
            </Container>
          </Grid>

          {/* Booking Options (show only if business_type_id === 1) */}
          {data.business_type_id === 1 && (
            <Grid xs={8}>
              <Container padding="0 20px" gap="20px">
                <FormControl>
                  <Label margin="0 0 5px 0">
                    <Text variant="medium">Booking Options *</Text>
                  </Label>
                  <ToggleButtonGroup
                    color="primary"
                    value={
                      data.hasBooking === true
                        ? "Integrated Booking"
                        : data.hasBooking === false
                        ? "External Booking"
                        : ""
                    }
                    exclusive
                    onChange={(e, value) => {
                      if (!value) return;
                      if (value === "External Booking") {
                        setData((prev) => ({ ...prev, hasBooking: false }));
                      } else if (value === "Integrated Booking") {
                        setData((prev) => ({ ...prev, hasBooking: true }));
                      }
                    }}
                    sx={{ display: "flex", gap: 2, mt: 1 }}
                  >
                    <ToggleButton
                      value="External Booking"
                      sx={{
                        flex: 1,
                        borderRadius: "12px",
                        px: 3,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        textTransform: "none",
                      }}
                    >
                      <Language fontSize="small" />
                      External Booking
                    </ToggleButton>

                    <ToggleButton
                      value="Integrated Booking"
                      sx={{
                        flex: 1,
                        borderRadius: "12px",
                        px: 3,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        textTransform: "none",
                      }}
                    >
                      <EventAvailable fontSize="small" />
                      Integrated Booking
                    </ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>

                {/* External Booking Selected */}
                {data.hasBooking === false && (
                  <Container padding="10px 0" gap="15px">
                    <Label>
                      <Text variant="medium">External Booking Platforms</Text>
                    </Label>

                    {bookingSite.map((site, index) => (
                      <Grid container spacing={2} key={index}>
                        <Grid xs={4}>
                          <FormControl>
                            <Select
                              size="lg"
                              placeholder="Select Platform"
                              value={site.name}
                              onChange={(_event, value) => {
                                const newSites = [...bookingSite];
                                newSites[index].name = value ?? "";
                                setBookingSites(newSites);
                              }}
                            >
                              <Option value="">Choose Platform</Option>
                              {bookingSiteOptions.map((opt) => (
                                <Option key={opt} value={opt}>
                                  {opt}
                                </Option>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid xs={8}>
                          <FormControl>
                            <Input
                              size="lg"
                              placeholder="Paste the link here."
                              value={site.link}
                              onChange={(e) => {
                                const newSites = [...bookingSite];
                                newSites[index].link = e.target.value;
                                setBookingSites(newSites);
                              }}
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                    ))}

                    <Button
                      size="lg"
                      startDecorator={<AddBox />}
                      onClick={addBookingSite}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      Add Another Platform
                    </Button>
                  </Container>
                )}

                {/* Integrated Booking Selected */}
                {data.hasBooking === true && (
                  <Container padding="10px 0" gap="15px">
                    <Text variant="medium" color="dark">
                      ✅ Integrated booking will be handled within the system.
                    </Text>
                  </Container>
                )}
              </Container>
            </Grid>
          )}
        </Grid>
      </div>
    </div>
  );
};

export default Step4;
