import React from "react";
import {
  Button,
  Stack,
  Typography,
  Sheet,
} from "@mui/joy";
import { Edit } from "lucide-react";
import type { TouristSpot } from "@/src/types/TouristSpot";

interface BasicInfoSectionProps {
  spot: TouristSpot;
  onEdit: () => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ spot, onEdit }) => {
  const feeDisplay = React.useMemo(() => {
    if (!spot || spot.entry_fee == null) return "N/A";
    try {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(spot.entry_fee);
    } catch {
      return `₱${spot.entry_fee}`;
    }
  }, [spot]);

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="h3">{spot.name}</Typography>
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

        {/* Description */}
        <Stack spacing={0.5}>
          <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
            Description
          </Typography>
          <Typography level="body-md">
            {spot.description || "No description available"}
          </Typography>
        </Stack>

        {/* Category/Type */}
        <Stack spacing={0.5}>
          <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
            Type / Category
          </Typography>
            <Typography level="body-md">
              {spot.type} / {Array.isArray(spot.categories)
                ? spot.categories.map((cat) => cat.category || String(cat)).join(", ")
                : ""}
            </Typography>
        </Stack>

        {/* Entry Fee */}
        <Stack spacing={0.5}>
          <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
            Entry Fee
          </Typography>
          <Typography level="body-md">
            {feeDisplay}
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default BasicInfoSection;
