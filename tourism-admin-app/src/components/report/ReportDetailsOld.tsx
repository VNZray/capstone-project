import React, { useEffect, useState } from "react";
import { apiService } from "../../utils/api";
import type { Report } from "../../types/Report";
import {
  Alert,
  Button,
  Stack,
  Typography,
  Grid,
} from "@mui/joy";
import {
  BasicReportSection,
  ReporterInfoSection,
  TargetInfoSection,
  StatusHistorySection,
  AttachmentsSection,
} from "./ReportDetails/index";
import UpdateStatusModal from "./UpdateStatusModal";

interface ReportDetailsProps {
  reportId: string;
  onBack: () => void;
  onStatusUpdated?: () => void;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({
  reportId,
  onBack,
  onStatusUpdated,
}) => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getReportById(reportId);
        setReport(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load report details.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  const handleStatusUpdate = async () => {
    try {
      const updatedReport = await apiService.getReportById(reportId);
      setReport(updatedReport);
      setShowUpdateModal(false);
      onStatusUpdated?.();
    } catch (err) {
      console.error("Failed to refresh report data:", err);
    }
  };

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

  const isImageFile = (fileName: string, fileType?: string) => {
    if (fileType) {
      return fileType.startsWith('image/');
    }
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const downloadAttachment = (attachment: { file_url: string; file_name: string }) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    link.target = '_blank';
    link.click();
  };

  if (loading) return <Typography level="body-md">Loading report details...</Typography>;
  if (error) return <Alert color="danger" variant="soft">{error}</Alert>;
  if (!report) return <Alert color="warning">No report found.</Alert>;

  return (
    <div className="report-details-container">
      {/* Header */}
      <div className="report-details-header">
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<IoArrowBack />}
          onClick={onBack}
        >
          Back to Reports
        </Button>
        <Button
          variant="solid"
          size="sm"
          onClick={() => setShowUpdateModal(true)}
        >
          Update Status
        </Button>
      </div>

      <div className="report-details-content">
        {/* Main Report Info */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <div className="report-title-section">
                <Typography level="h3" sx={{ mb: 1 }}>
                  {report.title}
                </Typography>
                <div className="report-badges">
                  <Chip
                    color={getStatusColor(report.status)}
                    variant="soft"
                    size="lg"
                  >
                    {report.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                  <Chip color="primary" variant="outlined">
                    {report.target_type.replace('_', ' ').toUpperCase()}
                  </Chip>
                </div>
              </div>

              <Typography level="body-md" sx={{ lineHeight: 1.6 }}>
                {report.description}
              </Typography>

              <Divider />

              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography level="title-sm" startDecorator={<IoPerson />}>
                      Reporter Information
                    </Typography>
                    <Typography level="body-sm">
                      Email: {report.reporter_email || 'Unknown'}
                    </Typography>
                    <Typography level="body-sm">
                      ID: {report.reporter_id}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography level="title-sm" startDecorator={<IoFlag />}>
                      Target Information
                    </Typography>
                    <Typography level="body-sm">
                      Type: {report.target_type.replace('_', ' ')}
                    </Typography>
                    <Typography level="body-sm">
                      ID: {report.target_id}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Attachments */}
        {report.attachments && report.attachments.length > 0 && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }} startDecorator={<IoImage />}>
                Attachments ({report.attachments.length})
              </Typography>
              
              <div className="attachments-grid">
                {report.attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    {isImageFile(attachment.file_name, attachment.file_type) ? (
                      <div 
                        className="attachment-image-container"
                        onClick={() => setSelectedImage(attachment.file_url)}
                      >
                        <img
                          src={attachment.file_url}
                          alt={attachment.file_name}
                          className="attachment-image"
                        />
                        <div className="attachment-overlay">
                          <Typography level="body-sm" sx={{ color: 'white', textAlign: 'center' }}>
                            Click to view full size
                          </Typography>
                        </div>
                      </div>
                    ) : (
                      <div className="attachment-file">
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          📎 {attachment.file_name}
                        </Typography>
                      </div>
                    )}
                    
                    <div className="attachment-info">
                      <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                        {attachment.file_type} • {attachment.file_size ? Math.round(attachment.file_size / 1024) + ' KB' : 'Unknown size'}
                      </Typography>
                      <Button
                        size="sm"
                        variant="soft"
                        startDecorator={<IoDownload />}
                        onClick={() => downloadAttachment(attachment)}
                        sx={{ mt: 1 }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status History Timeline */}
        {report.status_history && report.status_history.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }} startDecorator={<IoTime />}>
                Status History
              </Typography>
              
              <div className="timeline">
                {report.status_history.map((history, index) => (
                  <div key={history.id} className="timeline-item">
                    <div className="timeline-marker">
                      <div className={`timeline-dot ${history.status}`}></div>
                      {index < report.status_history!.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <Chip
                          color={getStatusColor(history.status)}
                          variant="soft"
                          size="sm"
                        >
                          {history.status.replace('_', ' ')}
                        </Chip>
                        <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                          {formatDate(history.updated_at)}
                        </Typography>
                      </div>
                      
                      {history.remarks && (
                        <Typography level="body-sm" sx={{ mt: 1 }}>
                          {history.remarks}
                        </Typography>
                      )}
                      
                      {history.updated_by_email && (
                        <Typography level="body-xs" sx={{ opacity: 0.6, mt: 0.5 }}>
                          Updated by: {history.updated_by_email}
                        </Typography>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Update Status Modal */}
      <UpdateStatusModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        report={report}
        onStatusUpdated={handleStatusUpdate}
      />

      {/* Image Preview Modal */}
      <Modal open={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <ModalDialog size="lg" sx={{ maxWidth: '90vw', maxHeight: '90vh' }}>
          <ModalClose />
          <div className="image-modal-content">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size preview"
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              />
            )}
          </div>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default ReportDetails;
