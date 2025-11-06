import React from "react";
import { Button, Stack, Typography, Sheet } from "@mui/joy";
import { LucidePhone, Globe } from "lucide-react";
import { MdEmail } from "react-icons/md";
import { Edit } from "lucide-react";
import type { TouristSpot } from "@/src/types/TouristSpot";

interface SocialsInfoSectionProps {
  spot: TouristSpot;
  onEdit: () => void;
}

const SocialsInfoSection: React.FC<SocialsInfoSectionProps> = ({ spot, onEdit }) => {
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
            Contact & Social Media
        </Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          className="tsd-edit-btn"
          onClick={onEdit}
        >
          Edit
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Email */}
        <Typography startDecorator={<MdEmail size={20} />} level="body-md">
          {spot.contact_email || "No email available"}
        </Typography>

        {/* Phone */}
        <Typography startDecorator={<LucidePhone size={20} />} level="body-md">
          {spot.contact_phone || "No phone number available"}
        </Typography>

        {/* Website */}
        <Typography startDecorator={<Globe size={20} />} level="body-md">
          {spot.website ? (
            <a href={spot.website} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
              {spot.website}
            </a>
          ) : (
            "No Website URL available"
          )}
        </Typography>
      </Stack>
    </Sheet>
  );
};

export default SocialsInfoSection;
