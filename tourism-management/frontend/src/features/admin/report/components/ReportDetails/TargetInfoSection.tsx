import React from "react";
import {
  Stack,
  Typography,
  Sheet,
  Chip,
  Divider,
} from "@mui/joy";
import { Target, Hash, Tag } from "lucide-react";
import type { Report } from "@/src/types/Report";

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

  const formatTypeLabel = (type: string) =>
    (type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const getTargetDisplayName = (r: Report): string | null => {
    const info: any = r.target_info ?? {};
    const t = r.target_type;
    switch (t) {
      case 'business':
        return (
          info.business_name ?? info.name ?? info.shop_name ?? info.title ?? null
        );
      case 'event':
        return info.name ?? info.event_name ?? info.title ?? null;
      case 'tourist_spot':
        return info.name ?? info.spot_name ?? null;
      case 'accommodation':
        return info.business_name ?? info.name ?? info.room_name ?? null;
      // Tourist isn't a valid target_type for admin reports yet,
      // but in case backend returns such info, try to render a full name.
      // Fall through to default.
      default:
        return info.name ?? null;
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
          <Chip color={getTargetTypeColor(report.target_type)} variant="soft" size="md">
            {formatTypeLabel(report.target_type)}
          </Chip>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography level="title-sm">
            Target Name
          </Typography>
          <Typography level="body-md">
            {getTargetDisplayName(report) || `${formatTypeLabel(report.target_type)} ${report.target_id}`}
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
