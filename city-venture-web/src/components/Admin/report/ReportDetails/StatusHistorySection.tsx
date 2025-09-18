import React from "react";
import {
  Stack,
  Typography,
  Sheet,
  Chip,
  Box,
} from "@mui/joy";
import { History, Clock, User } from "lucide-react";
import type { Report } from "../../../../types/Report";

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

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#9e9e9e';
      case 'under_review': return '#ff9800';
      case 'in_progress': return '#2196f3';
      case 'resolved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#9e9e9e';
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
        Status Timeline
      </Typography>

      {report.status_history && report.status_history.length > 0 ? (
        <Stack spacing={0}>
          {report.status_history
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .map((history, index) => (
              <Box key={history.id} sx={{ display: 'flex', mb: index < report.status_history!.length - 1 ? 3 : 0 }}>
                {/* Timeline Marker */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  mr: 2, 
                  flexShrink: 0 
                }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      boxShadow: `0 0 0 2px ${getStatusDotColor(history.status)}`,
                      backgroundColor: getStatusDotColor(history.status),
                      mb: 0.5,
                    }}
                  />
                  {index < report.status_history!.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        flex: 1,
                        backgroundColor: '#e0e0e0',
                        minHeight: 24,
                        mt: 0.5,
                      }}
                    />
                  )}
                </Box>

                {/* Timeline Content */}
                <Stack spacing={1} sx={{ flex: 1, pt: '-2px' }}>
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
                  
                  {history.remarks && (
                    <Typography level="body-sm" sx={{ lineHeight: 1.4 }}>
                      {history.remarks}
                    </Typography>
                  )}
                  
                  {history.updated_by_email && (
                    <Typography level="body-xs" startDecorator={<User size={12} />} sx={{ opacity: 0.6 }}>
                      Updated by: {history.updated_by_email}
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))
          }
        </Stack>
      ) : (
        <Typography level="body-sm" sx={{ opacity: 0.7, textAlign: 'center', py: 2 }}>
          No status history available
        </Typography>
      )}
    </Sheet>
  );
};

export default StatusHistorySection;
