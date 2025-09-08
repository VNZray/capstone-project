import React from "react";
import {
  Stack,
  Typography,
  Sheet,
  Divider,
} from "@mui/joy";
import { User, Mail, Hash } from "lucide-react";
import type { Report } from "../../../types/Report";

interface ReporterInfoSectionProps {
  report: Report;
}

const ReporterInfoSection: React.FC<ReporterInfoSectionProps> = ({ report }) => {
  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Typography level="h4" sx={{ mb: 2 }} startDecorator={<User size={18} />}>
        Reporter Information
      </Typography>

      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography level="title-sm" startDecorator={<Mail size={14} />}>
            Email Address
          </Typography>
          <Typography level="body-md">
            {report.reporter_email || 'Not provided'}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography level="title-sm" startDecorator={<Hash size={14} />}>
            Reporter ID
          </Typography>
          <Typography level="body-sm" sx={{ fontFamily: 'monospace', opacity: 0.7 }}>
            {report.reporter_id}
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default ReporterInfoSection;
