import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Chip, 
  Stack, 
  Sheet, 
  Grid 
} from "@mui/joy";
import ResponsiveButton from "@/src/components/ResponsiveButton";
import type { Report } from "@/src/types/Report";
import { apiService } from "@/src/utils/api";

interface ReportTableProps {
  reports: Report[];
  onViewDetails: (report: Report) => void;
  onUpdateStatus: (report: Report) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  onViewDetails,
  onUpdateStatus,
}) => {
  const [reportsWithTargetInfo, setReportsWithTargetInfo] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargetInfo = async () => {
      setLoading(true);
      const updatedReports = await Promise.all(
        reports.map(async (report) => {
          try {
            const targetInfo = await apiService.getTargetInfo(report.target_type, report.target_id);
            return { ...report, target_info: targetInfo };
          } catch {
            return { 
              ...report, 
              target_info: { 
                name: `${report.target_type} ${report.target_id}`, 
                type: report.target_type 
              } 
            };
          }
        })
      );
      setReportsWithTargetInfo(updatedReports);
      setLoading(false);
    };

    if (reports.length > 0) {
      fetchTargetInfo();
    } else {
      setReportsWithTargetInfo([]);
      setLoading(false);
    }
  }, [reports]);
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

  const getTargetTypeColor = (targetType: string) => {
    switch (targetType) {
      case 'business': return 'primary';
      case 'event': return 'warning';
      case 'tourist_spot': return 'success';
      case 'accommodation': return 'neutral';
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

  if (loading) {
    return (
      <Sheet variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 8 }}>
        <Typography level="body-md">Loading report details...</Typography>
      </Sheet>
    );
  }

  return (
    <Stack spacing={1}>
      {/* Header */}
      <Sheet
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: '#0A1B47',
          borderRadius: 8,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={3}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: '#fff' }}>
              Report Title
            </Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: '#fff' }}>
              Reporter
            </Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: '#fff' }}>
              Target
            </Typography>
          </Grid>
          <Grid xs={12} sm={1.5}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: '#fff' }}>
              Status
            </Typography>
          </Grid>
          <Grid xs={12} sm={1.5}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: '#fff' }}>
              Created
            </Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: '#fff' }}>
              Actions
            </Typography>
          </Grid>
        </Grid>
      </Sheet>

      {/* Rows */}
      {reportsWithTargetInfo.map((report) => (
        <Sheet
          key={report.id}
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: '#fff',
            borderRadius: 8,
            '&:hover': {
              backgroundColor: '#f8f9fa',
            },
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={3}>
              <Stack spacing={0.5}>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {report.title}
                </Typography>
                <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                  {report.description.length > 50
                    ? `${report.description.substring(0, 50)}...`
                    : report.description}
                </Typography>
              </Stack>
            </Grid>

            <Grid xs={12} sm={2}>
              <Typography level="body-md">
                {report.reporter_email || 'Unknown'}
              </Typography>
            </Grid>
            
            <Grid xs={12} sm={2}>
              <Stack spacing={0.5}>
                <Chip
                  color={getTargetTypeColor(report.target_type)}
                  variant="soft"
                  size="sm"
                >
                  {report.target_info?.type || report.target_type.replace('_', ' ')}
                </Chip>
                <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                  {report.target_info?.name || report.target_id}
                </Typography>
              </Stack>
            </Grid>
            
            <Grid xs={12} sm={1.5}>
              <Chip
                color={getStatusColor(report.status)}
                variant="soft"
                size="sm"
              >
                {report.status.replace('_', ' ')}
              </Chip>
            </Grid>
            
            <Grid xs={12} sm={1.5}>
              <Typography level="body-sm">
                {formatDate(report.created_at)}
              </Typography>
            </Grid>
            
            <Grid xs={12} sm={2}>
              <Stack direction="row" spacing={1}>
                <ResponsiveButton
                  size="sm"
                  variant="outlined"
                  color="success"
                  onClick={() => onViewDetails(report)}
                >
                  View
                </ResponsiveButton>
                <ResponsiveButton
                  size="sm"
                  variant="outlined"
                  color="primary"
                  onClick={() => onUpdateStatus(report)}
                >
                  Update
                </ResponsiveButton>
              </Stack>
            </Grid>
          </Grid>
        </Sheet>
      ))}

      {reportsWithTargetInfo.length === 0 && (
        <Sheet 
          variant="outlined" 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 8,
            borderStyle: 'dashed'
          }}
        >
          <Typography level="body-md">
            No reports found
          </Typography>
        </Sheet>
      )}
    </Stack>
  );
};

export default ReportTable;
