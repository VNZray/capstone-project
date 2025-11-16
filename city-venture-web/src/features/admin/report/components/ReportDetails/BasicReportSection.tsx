import React from "react";
import {
  Stack,
  Typography,
  Sheet,
  Chip,
} from "@mui/joy";
import { Edit, Flag} from "lucide-react";
import type { Report } from "@/src/types/Report";
import Button from "@/src/components/Button";

interface BasicReportSectionProps {
  report: Report;
  onEdit: () => void;
}

const BasicReportSection: React.FC<BasicReportSectionProps> = ({ report, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'neutral';
      case 'under_review': return 'warning';
      case 'in_progress': return 'primary';
      case 'resolved': return 'success';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="h3">{report.title}</Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
        >
          Update Status
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Status */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            color={getStatusColor(report.status)}
            variant="soft"
            size="md"
            startDecorator={<Flag size={14} />}
          >
            {report.status.replace('_', ' ')}
          </Chip>
          <Chip
            color="primary"
            variant="outlined"
            size="md"
          >
            {report.target_type.replace('_', ' ')}
          </Chip>
        </Stack>

        {/* Description */}
        <Stack spacing={1}>
          <Typography level="title-sm">Description</Typography>
          <Typography level="body-md" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {report.description}
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default BasicReportSection;
