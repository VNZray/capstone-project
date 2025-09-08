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

  const handleSectionEdit = () => {
    setShowUpdateModal(true);
  };

  if (loading) return <Typography level="body-md">Loading report details...</Typography>;
  if (error) return <Alert color="danger" variant="soft">{error}</Alert>;
  if (!report) return <Alert color="warning">No report found.</Alert>;

  return (
    <Stack spacing={1}>
      {/* Header with Back Button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography level="h2">Report Details</Typography>
        <Button variant="plain" onClick={onBack}> ← Back </Button>
      </Stack>

      <Grid container spacing={1}>
        {/* Left Column*/}
        <Grid xs={12} lg={8}>
          <Stack spacing={2}>
            <BasicReportSection 
              report={report} 
              onEdit={handleSectionEdit} 
            />
            <AttachmentsSection report={report} />
            <StatusHistorySection report={report}/>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid xs={12} lg={4}>
          <Stack spacing={2}>
            <ReporterInfoSection report={report}/>
            <TargetInfoSection report={report}/>
          </Stack>
        </Grid>
      </Grid>

      <UpdateStatusModal
        report={report}
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onStatusUpdated={handleStatusUpdate}
      />
    </Stack>
  );
};

export default ReportDetails;
