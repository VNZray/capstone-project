import React from "react";
import {
  Button,
  Stack,
  Typography,
  Sheet,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/joy";
import { ChevronDown } from "lucide-react";
import { Edit } from "lucide-react";

interface TouristSpotImage {
  id: string;
  tourist_spot_id: string;
  file_url: string;
  file_format: string;
  file_size?: number;
  filename?: string;
  file_name?: string;
  url?: string;
  supabase_url?: string;
  alt_text?: string;
  is_primary: boolean;
  uploaded_at: string;
  updated_at?: string;
}

interface ImagesInfoSectionProps {
  images: TouristSpotImage[];
  onEdit: () => void;
}

const ImagesInfoSection: React.FC<ImagesInfoSectionProps> = ({ images, onEdit }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="h3">Images</Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
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
                      src={image.file_url || image.supabase_url || image.url}
                      alt={image.alt_text || `Tourist spot image ${index + 1}`}
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
                    src={image.file_url || image.supabase_url || image.url}
                    alt={image.alt_text || `Tourist spot image ${index + 1}`}
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
                    backgroundColor: "background.level1",
                  }}
                >
                  <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    +{images.length - 4} more
                  </Typography>
                </Sheet>
              )}
            </Stack>
          )}
        </>
      ) : (
        <Sheet
          variant="outlined"
          sx={{
            height: 180,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.level1",
          }}
        >
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            No images available
          </Typography>
        </Sheet>
      )}
    </Sheet>
  );
};

export default ImagesInfoSection;
