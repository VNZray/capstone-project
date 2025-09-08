import React from "react";
import {
  Button,
  Stack,
  Typography,
  Sheet,
  Chip,
  Divider,
} from "@mui/joy";
import { Edit, Flag, Clock } from "lucide-react";
import type { Report } from "../../../types/Report";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

        <Divider />

        {/* Description */}
        <Stack spacing={1}>
          <Typography level="title-sm">Description</Typography>
          <Typography level="body-md" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {report.description}
          </Typography>
        </Stack>

        <Divider />

        {/* Timestamps */}
        <Stack spacing={1}>
          <Typography level="title-sm" startDecorator={<Clock size={16} />}>
            Timeline
          </Typography>
          <Stack spacing={0.5}>
            <Typography level="body-sm">
              <strong>Created:</strong> {formatDate(report.created_at)}
            </Typography>
            {report.updated_at && (
              <Typography level="body-sm">
                <strong>Last Updated:</strong> {formatDate(report.updated_at)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default BasicReportSection;
