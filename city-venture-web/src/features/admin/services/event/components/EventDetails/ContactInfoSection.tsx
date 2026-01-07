import React from "react";
import { Stack, Typography, Sheet } from "@mui/joy";
import { LucidePhone, Globe, Link2 } from "lucide-react";
import { MdEmail } from "react-icons/md";
import { Edit } from "lucide-react";
import type { Event } from "@/src/types/Event";
import Button from "@/src/components/Button";

interface ContactInfoSectionProps {
  event: Event;
  onEdit: () => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
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
          Contact Information
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
        {/* Email */}
        <Typography startDecorator={<MdEmail size={20} />} level="body-md">
          {event.contact_email || "No email available"}
        </Typography>

        {/* Phone */}
        <Typography startDecorator={<LucidePhone size={20} />} level="body-md">
          {event.contact_phone || "No phone number available"}
        </Typography>

        {/* Website */}
        <Typography startDecorator={<Globe size={20} />} level="body-md">
          {event.website ? (
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {event.website}
            </a>
          ) : (
            "No website available"
          )}
        </Typography>

        {/* Registration URL */}
        {event.registration_url && (
          <Typography startDecorator={<Link2 size={20} />} level="body-md">
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Register for this event
            </a>
          </Typography>
        )}
      </Stack>
    </Sheet>
  );
};

export default ContactInfoSection;
