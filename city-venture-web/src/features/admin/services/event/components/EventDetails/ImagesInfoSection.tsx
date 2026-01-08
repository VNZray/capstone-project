import React from "react";
import {
  Stack,
  Typography,
  Sheet,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/joy";
import { ChevronDown, Edit } from "lucide-react";
import type { EventImage } from "@/src/types/Event";
import Button from "@/src/components/Button";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

interface ImagesInfoSectionProps {
  images: EventImage[];
  onEdit: () => void;
}

const ImagesInfoSection: React.FC<ImagesInfoSectionProps> = ({ images, onEdit }) => {
  const [expanded, setExpanded] = React.useState(false);

  const getImageUrl = (image: EventImage): string => {
    return image.file_url || placeholderImage;
  };

  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          fontFamily={"poppins"}
          level="title-lg"
          fontWeight={700}
          sx={{ color: "#1e293b" }}
        >
          Images
        </Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
          sx={{ borderRadius: "8px" }}
        >
          Edit
        </Button>
      </Stack>

      {images.length > 0 ? (
        <>
          <Accordion
            expanded={expanded}
            onChange={() => setExpanded((prev) => !prev)}
            sx={{ boxShadow: "none", background: "none", p: 0 }}
          >
            <AccordionSummary
              indicator={<ChevronDown size={18} />}
              sx={{ px: 0, py: 0.5, minHeight: 0 }}
            >
              <Typography level="body-md" sx={{ fontWeight: 500 }}>
                {expanded
                  ? `Hide Images (${images.length})`
                  : `Show All Images (${images.length})`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 1 }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {images.map((image, index) => (
                  <Sheet
                    key={image.id || index}
                    variant="outlined"
                    sx={{
                      width: index === 0 ? 300 : 140,
                      height: index === 0 ? 200 : 140,
                      borderRadius: 8,
                      overflow: "hidden",
                      position: "relative",
                      "& img": {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      },
                    }}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={image.alt_text || `Event image ${index + 1}`}
                    />
                    {image.is_primary && (
                      <Typography
                        level="body-xs"
                        sx={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          backgroundColor: "primary.solidBg",
                          color: "primary.solidColor",
                          px: 1,
                          py: 0.5,
                          borderRadius: 4,
                        }}
                      >
                        Primary
                      </Typography>
                    )}
                  </Sheet>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
          {!expanded && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}>
              {images.slice(0, 4).map((image, index) => (
                <Sheet
                  key={image.id || index}
                  variant="outlined"
                  sx={{
                    width: index === 0 ? 300 : 140,
                    height: index === 0 ? 200 : 140,
                    borderRadius: 8,
                    overflow: "hidden",
                    position: "relative",
                    "& img": {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    },
                  }}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt_text || `Event image ${index + 1}`}
                  />
                  {image.is_primary && (
                    <Typography
                      level="body-xs"
                      sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        backgroundColor: "primary.solidBg",
                        color: "primary.solidColor",
                        px: 1,
                        py: 0.5,
                        borderRadius: 4,
                      }}
                    >
                      Primary
                    </Typography>
                  )}
                </Sheet>
              ))}
              {images.length > 4 && (
                <Sheet
                  variant="outlined"
                  sx={{
                    width: 140,
                    height: 140,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "neutral.100",
                  }}
                >
                  <Typography level="body-lg" fontWeight={600} sx={{ color: "#6b7280" }}>
                    +{images.length - 4}
                  </Typography>
                </Sheet>
              )}
            </Stack>
          )}
        </>
      ) : (
        <Typography level="body-md" sx={{ color: "#6b7280", fontStyle: "italic" }}>
          No images uploaded
        </Typography>
      )}
    </Sheet>
  );
};

export default ImagesInfoSection;
