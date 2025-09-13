import React from "react";
import {
  Button,
  Link,
  Stack,
  Typography,
  Sheet,
} from "@mui/joy";
import { Edit } from "lucide-react";
import type { TouristSpot } from "@/src/types/TouristSpot";

interface SocialsInfoSectionProps {
  spot: TouristSpot;
  onEdit: () => void;
}

const SocialsInfoSection: React.FC<SocialsInfoSectionProps> = ({ spot, onEdit }) => {
  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="h4">Contact & Social Media</Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
        >
          Edit
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Contact Phone */}
        <Stack spacing={0.5}>
          <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
            Phone
          </Typography>
          <Typography level="body-md">
            {spot.contact_phone || "Not provided"}
          </Typography>
        </Stack>

        {/* Contact Email */}
        <Stack spacing={0.5}>
          <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
            Email
          </Typography>
          <Typography level="body-md">
            {spot.contact_email || "Not provided"}
          </Typography>
        </Stack>

        {/* Website */}
        <Stack spacing={0.5}>
          <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
            Website
          </Typography>
          {spot.website ? (
            <Link
              href={spot.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                wordBreak: "break-all",
                fontSize: "sm",
              }}
            >
              {spot.website.length > 40
                ? `${spot.website.substring(0, 40)}...`
                : spot.website}
            </Link>
          ) : (
            <Typography level="body-md">Not provided</Typography>
          )}
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default SocialsInfoSection;
