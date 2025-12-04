import React from "react";
import { Box, Grid, FormControl, Input, Checkbox, IconButton } from "@mui/joy";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import type { BusinessHours } from "@/src/types/Business";

type Props = {
  businessHours: BusinessHours[];
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
  bookingSites: { name: string; link: string }[];
  setBookingSites: React.Dispatch<
    React.SetStateAction<{ name: string; link: string }[]>
  >;
};

const Step4Hours: React.FC<Props> = ({
  businessHours,
  setBusinessHours,
  bookingSites,
  setBookingSites,
}) => {
  const handleTimeChange = (
    index: number,
    field: "open_time" | "close_time",
    value: string
  ) => {
    setBusinessHours((prev) =>
      prev.map((hour, i) => (i === index ? { ...hour, [field]: value } : hour))
    );
  };

  const handleToggleDay = (index: number) => {
    setBusinessHours((prev) =>
      prev.map((hour, i) =>
        i === index ? { ...hour, is_open: !hour.is_open } : hour
      )
    );
  };

  const addBookingSite = () => {
    setBookingSites((prev) => [...prev, { name: "", link: "" }]);
  };

  const removeBookingSite = (index: number) => {
    setBookingSites((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBookingSite = (
    index: number,
    field: "name" | "link",
    value: string
  ) => {
    setBookingSites((prev) =>
      prev.map((site, i) => (i === index ? { ...site, [field]: value } : site))
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography.CardTitle size="md" sx={{ mb: 1, color: colors.primary }}>
          Business Hours
        </Typography.CardTitle>
        <Typography.Body size="sm" sx={{ color: colors.gray }}>
          Set your operating hours and booking links
        </Typography.Body>
      </Box>

      <Grid container spacing={3}>
        {/* Business Hours */}
        <Grid xs={12} md={7}>
          <Box
            sx={{
              p: 3,
              backgroundColor: colors.white,
              borderRadius: "12px",
              border: `1px solid ${colors.offWhite}`,
            }}
          >
            <Typography.Label size="sm" sx={{ mb: 2, display: "block" }}>
              Operating Hours
            </Typography.Label>
            <Grid container spacing={2}>
              {businessHours.map((hour, index) => (
                <Grid xs={12} key={hour.day_of_week}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Checkbox
                      checked={hour.is_open}
                      onChange={() => handleToggleDay(index)}
                      label={
                        <Typography.Body size="sm" weight="semibold">
                          {hour.day_of_week}
                        </Typography.Body>
                      }
                      sx={{ minWidth: "120px" }}
                    />
                    {hour.is_open && (
                      <>
                        <Input
                          type="time"
                          value={hour.open_time}
                          onChange={(e) =>
                            handleTimeChange(index, "open_time", e.target.value)
                          }
                          size="sm"
                          sx={{
                            flex: "1 1 120px",
                            minWidth: "120px",
                            backgroundColor: colors.white,
                            borderColor: colors.gray,
                          }}
                        />
                        <Typography.Body size="sm">to</Typography.Body>
                        <Input
                          type="time"
                          value={hour.close_time}
                          onChange={(e) =>
                            handleTimeChange(
                              index,
                              "close_time",
                              e.target.value
                            )
                          }
                          size="sm"
                          sx={{
                            flex: "1 1 120px",
                            minWidth: "120px",
                            backgroundColor: colors.white,
                            borderColor: colors.gray,
                          }}
                        />
                      </>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Booking Sites */}
        <Grid xs={12} md={5}>
          <Box
            sx={{
              p: 3,
              backgroundColor: colors.white,
              borderRadius: "12px",
              border: `1px solid ${colors.offWhite}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography.Label size="sm">
                Booking Links (Optional)
              </Typography.Label>
              <IconButton
                size="sm"
                variant="soft"
                color="primary"
                onClick={addBookingSite}
              >
                <Plus size={18} />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              {bookingSites.length === 0 ? (
                <Grid xs={12}>
                  <Typography.Body
                    size="xs"
                    sx={{
                      color: colors.gray,
                      fontStyle: "italic",
                      textAlign: "center",
                      py: 2,
                    }}
                  >
                    No booking links added yet
                  </Typography.Body>
                </Grid>
              ) : (
                bookingSites.map((site, index) => (
                  <Grid xs={12} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: colors.offWhite,
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <FormControl sx={{ flex: 1 }}>
                          <Input
                            size="sm"
                            placeholder="Platform name"
                            value={site.name}
                            onChange={(e) =>
                              updateBookingSite(index, "name", e.target.value)
                            }
                            sx={{
                              backgroundColor: colors.white,
                              borderColor: colors.gray,
                            }}
                          />
                        </FormControl>
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="danger"
                          onClick={() => removeBookingSite(index)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                      <FormControl>
                        <Input
                          size="sm"
                          placeholder="https://..."
                          value={site.link}
                          onChange={(e) =>
                            updateBookingSite(index, "link", e.target.value)
                          }
                          startDecorator={<LinkIcon size={16} />}
                          sx={{
                            backgroundColor: colors.white,
                            borderColor: colors.gray,
                          }}
                        />
                      </FormControl>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step4Hours;
