import React from "react";
import { Stack, Typography, Sheet, Chip } from "@mui/joy";
import { Edit, Building2, User } from "lucide-react";
import type { Event } from "@/src/types/Event";
import Button from "@/src/components/Button";

interface OrganizerInfoSectionProps {
  event: Event;
  onEdit: () => void;
}

const organizerTypeLabels: Record<string, string> = {
  tourism_office: "Tourism Office",
  business: "Business",
  community: "Community",
};

const OrganizerInfoSection: React.FC<OrganizerInfoSectionProps> = ({
  event,
  onEdit,
}) => {
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
          Organizer
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

      <Stack spacing={2}>
        {/* Organizer Name */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Organizer Name
          </Typography>
          <Typography
            startDecorator={<User size={18} />}
            level="body-md"
          >
            {event.organizer_name || "Not specified"}
          </Typography>
        </Stack>

        {/* Organizer Type */}
        {event.organizer_type && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Organizer Type
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Building2 size={18} color="#6b7280" />
              <Chip size="sm" variant="soft" color="neutral">
                {organizerTypeLabels[event.organizer_type] || event.organizer_type}
              </Chip>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
};

export default OrganizerInfoSection;
