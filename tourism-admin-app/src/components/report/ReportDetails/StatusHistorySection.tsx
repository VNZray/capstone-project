import React from "react";
import {
  Stack,
  Typography,
  Sheet,
  Chip,
  Divider,
} from "@mui/joy";
import { History, Clock, User } from "lucide-react";
import type { Report } from "../../../types/Report";

interface StatusHistorySectionProps {
  report: Report;
}

const StatusHistorySection: React.FC<StatusHistorySectionProps> = ({ report }) => {
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Typography level="h4" sx={{ mb: 2 }} startDecorator={<History size={18} />}>
        Status History
      </Typography>

      <Stack spacing={2}>
        {report.status_history && report.status_history.length > 0 ? (
          report.status_history
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .map((history, index) => (
              <Stack key={history.id} spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip
                    color={getStatusColor(history.status)}
                    variant="soft"
                    size="sm"
                  >
                    {history.status.replace('_', ' ')}
                  </Chip>
                  <Typography level="body-xs" sx={{ opacity: 0.7 }} startDecorator={<Clock size={12} />}>
                    {formatDate(history.updated_at)}
                  </Typography>
                </Stack>
                
                {history.updated_by_email && (
                  <Typography level="body-sm" startDecorator={<User size={12} />}>
                    {history.updated_by_email}
                  </Typography>
                )}
                
                {history.remarks && (
                  <Typography level="body-sm" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                    "{history.remarks}"
                  </Typography>
                )}
                
                {index < report.status_history!.length - 1 && <Divider />}
              </Stack>
            ))
        ) : (
          <Typography level="body-sm" sx={{ opacity: 0.7, textAlign: 'center' }}>
            No status history available
          </Typography>
        )}
      </Stack>
    </Sheet>
  );
};

export default StatusHistorySection;
