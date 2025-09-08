import React from "react";
import {
  Stack,
  Typography,
  Sheet,
  Chip,
  Divider,
} from "@mui/joy";
import { Target, Hash, Tag } from "lucide-react";
import type { Report } from "../../../types/Report";

interface TargetInfoSectionProps {
  report: Report;
}

const TargetInfoSection: React.FC<TargetInfoSectionProps> = ({ report }) => {
  const getTargetTypeColor = (targetType: string) => {
    switch (targetType) {
      case 'business': return 'primary';
      case 'event': return 'warning';
      case 'tourist_spot': return 'success';
      case 'accommodation': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Typography level="h4" sx={{ mb: 2 }} startDecorator={<Target size={18} />}>
        Target Information
      </Typography>

      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography level="title-sm" startDecorator={<Tag size={14} />}>
            Target Type
          </Typography>
          <Chip
            color={getTargetTypeColor(report.target_type)}
            variant="soft"
            size="md"
          >
            {report.target_type.replace('_', ' ')}
          </Chip>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography level="title-sm">
            Target Name
          </Typography>
          <Typography level="body-md">
            {report.target_info?.name || 'Loading...'}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography level="title-sm" startDecorator={<Hash size={14} />}>
            Target ID
          </Typography>
          <Typography level="body-sm" sx={{ fontFamily: 'monospace', opacity: 0.7 }}>
            {report.target_id}
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default TargetInfoSection;
