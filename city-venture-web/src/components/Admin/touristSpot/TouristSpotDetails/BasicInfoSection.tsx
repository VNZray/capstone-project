import React from "react";
import { Button, Stack, Typography, Sheet, Chip } from "@mui/joy";
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
          About the spot
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

        {/* Description */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Description
          </Typography>
          <Typography level="body-md" sx={{ color: "#374151" }}>
            {spot.description || "No description available"}
          </Typography>
        </Stack>

        {/* Type / Category as chips */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Type / Category
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {spot.type && (
              <Chip size="md" variant="soft" color="neutral" sx={{ borderRadius: "20px", fontWeight: 500 }}>
                {spot.type}
              </Chip>
            )}
            {Array.isArray(spot.categories) && spot.categories.length > 0 ? (
              spot.categories.map((cat, idx) => (
                <Chip
                  key={`${(cat as any).id ?? idx}`}
                  size="md"
                  variant="soft"
                  color="neutral"
                  sx={{ borderRadius: "20px", fontWeight: 500 }}
                >
                  {(cat as any).category || String(cat)}
                </Chip>
              ))
            ) : (
              <Typography level="body-md" sx={{ color: "text.tertiary", fontStyle: "italic" }}>
                No categories provided
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* Entry Fee (hide if 0 or not set) */}
        {(Number(spot.entry_fee) || 0) > 0 && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Entrance Fee
            </Typography>
            <Typography level="body-md" sx={{ color: "#374151" }}>{feeDisplay}</Typography>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
};

export default BasicInfoSection;
