import React from "react";
import { Stack, Typography, Sheet } from "@mui/joy";
import { Edit, Phone, Mail, Globe, ExternalLink } from "lucide-react";
import Button from "@/src/components/Button";
import type { Event as EventType } from "@/src/types/Event";

interface ContactInfoSectionProps {
  event: EventType;
  onEdit: () => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ event, onEdit }) => {
  const hasContact = event.contact_phone || event.contact_email || event.website || event.organizer_name;

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
          Contact & Organizer
        </Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
          sx={{ borderRadius: '8px' }}
        >
          Edit
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Organizer */}
        {event.organizer_name && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Organizer
            </Typography>
            <Typography level="body-md" sx={{ color: "#374151" }}>
              {event.organizer_name}
            </Typography>
          </Stack>
        )}

        {/* Phone */}
        {event.contact_phone && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Phone
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Phone size={16} color="#6b7280" />
              <Typography
                level="body-md"
                component="a"
                href={`tel:${event.contact_phone}`}
                sx={{ color: "#3b82f6", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                {event.contact_phone}
              </Typography>
            </Stack>
          </Stack>
        )}

        {/* Email */}
        {event.contact_email && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Email
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Mail size={16} color="#6b7280" />
              <Typography
                level="body-md"
                component="a"
                href={`mailto:${event.contact_email}`}
                sx={{ color: "#3b82f6", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                {event.contact_email}
              </Typography>
            </Stack>
          </Stack>
        )}

        {/* Website */}
        {event.website && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Website
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Globe size={16} color="#6b7280" />
              <Typography
                level="body-md"
                component="a"
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: "#3b82f6", 
                  textDecoration: "none", 
                  "&:hover": { textDecoration: "underline" },
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5
                }}
              >
                {event.website.replace(/^https?:\/\//, "")}
                <ExternalLink size={12} />
              </Typography>
            </Stack>
          </Stack>
        )}

        {/* Registration URL */}
        {event.registration_url && (
          <Button
            variant="solid"
            colorScheme="primary"
            size="sm"
            startDecorator={<ExternalLink size={16} />}
            onClick={() => window.open(event.registration_url!, "_blank")}
            fullWidth
          >
            Register for Event
          </Button>
        )}

        {!hasContact && (
          <Typography level="body-md" sx={{ color: "text.tertiary", fontStyle: "italic", textAlign: "center" }}>
            No contact information provided
          </Typography>
        )}
      </Stack>
    </Sheet>
  );
};

export default ContactInfoSection;
