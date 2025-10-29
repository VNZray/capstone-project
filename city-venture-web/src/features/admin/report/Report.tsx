import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Box,
  Sheet
} from "@mui/joy";
import Container from "@/src/components/Container";
import SearchBar from "@/src/components/SearchBar";
import Pagination from "@/src/components/Admin/touristSpot/Pagination";
import ReportTable from "@/src/components/Admin/report/ReportTable";
import ReportFilters from "@/src/components/Admin/report/ReportFilters";
import { useNavigate } from "react-router-dom";
import UpdateStatusModal from "@/src/components/Admin/report/UpdateStatusModal";
import type { Report } from "@/src/types/Report";
import { apiService } from "@/src/utils/api";
import { colors } from "@/src/utils/Colors";

const ReportManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTargetType, setSelectedTargetType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReportForUpdate, setSelectedReportForUpdate] = useState<Report | null>(null);
  const reportsPerPage = 10;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reportsData = await apiService.getReports();
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };
  
  const handleTargetTypeChange = (targetType: string) => {
    setSelectedTargetType(targetType);
    setCurrentPage(1);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  
  const handleViewDetails = (report: Report) => {
    navigate(`/tourism/reports/${report.id}`);
  };

  const handleUpdateStatus = (report: Report) => {
    setSelectedReportForUpdate(report);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedReportForUpdate(null);
  };

  const handleStatusUpdated = () => {
    fetchReports();
    setShowUpdateModal(false);
    setSelectedReportForUpdate(null);
  };

  const filteredAndSearchedReports = useMemo(() => {
    let filtered = reports;

    if (selectedStatus !== "All") {
      filtered = filtered.filter((report) => report.status === selectedStatus);
    }

    if (selectedTargetType !== "All") {
      filtered = filtered.filter((report) => report.target_type === selectedTargetType);
    }

    if (searchQuery) {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.reporter_email && report.reporter_email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by updated_at (or created_at) descending so newest are on top
    return filtered.slice().sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [reports, selectedStatus, selectedTargetType, searchQuery]);

  const totalPages = Math.ceil(filteredAndSearchedReports.length / reportsPerPage);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * reportsPerPage;
    return filteredAndSearchedReports.slice(
      startIndex,
      startIndex + reportsPerPage
    );
  }, [filteredAndSearchedReports, currentPage, reportsPerPage]);

  // Stats for dashboard overview
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => ['submitted', 'under_review'].includes(r.status)).length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;
    
    return { total, pending, inProgress, resolved, rejected };
  }, [reports]);

  return (
    <>
      <Container background={colors.background} elevation={2}>
        <Stack spacing={2} sx={{ p: 2 }}>
          {/* Minimal Stats Cards */}
          <Grid container spacing={1}>
            <Grid xs={6} sm={3} md={2.4}>
              <Card variant="plain" sx={{ boxShadow: 'none', p: 1 }}>
                <CardContent sx={{ textAlign: 'center', p: 1 }}>
                  <Typography level="h3" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {stats.total}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={6} sm={3} md={2.4}>
              <Card variant="plain" sx={{ boxShadow: 'none', p: 1 }}>
                <CardContent sx={{ textAlign: 'center', p: 1 }}>
                  <Typography level="h3" sx={{ color: 'warning.500', fontWeight: 600 }}>
                    {stats.pending}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={6} sm={3} md={2.4}>
              <Card variant="plain" sx={{ boxShadow: 'none', p: 1 }}>
                <CardContent sx={{ textAlign: 'center', p: 1 }}>
                  <Typography level="h3" sx={{ color: 'primary.500', fontWeight: 600 }}>
                    {stats.inProgress}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={6} sm={3} md={2.4}>
              <Card variant="plain" sx={{ boxShadow: 'none', p: 1 }}>
                <CardContent sx={{ textAlign: 'center', p: 1 }}>
                  <Typography level="h3" sx={{ color: 'success.500', fontWeight: 600 }}>
                    {stats.resolved}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Resolved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={6} sm={3} md={2.4}>
              <Card variant="plain" sx={{ boxShadow: 'none', p: 1 }}>
                <CardContent sx={{ textAlign: 'center', p: 1 }}>
                  <Typography level="h3" sx={{ color: 'danger.500', fontWeight: 600 }}>
                    {stats.rejected}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Rejected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

            {/* Filters, Search, and Refresh aligned with cards/table */}
              <Grid container spacing={2} justifyContent="space-between"  alignItems="center" sx={{ width: '99%'}}>
              <Grid xs={12} sm={6} md={4}>
                <ReportFilters
                  selectedStatus={selectedStatus}
                  selectedTargetType={selectedTargetType}
                  onStatusChange={handleStatusChange}
                  onTargetTypeChange={handleTargetTypeChange}
                  onRefresh={fetchReports}
                />
              </Grid>
              <Grid xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Box sx={{ width: { xs: '100%', sm: '80%', md: '60%' }, minWidth: 240 }}>
                  <SearchBar
                    value={searchQuery}
                    onChangeText={handleSearch}
                    onSearch={() => console.log("Searching for:", searchQuery)}
                    placeholder="Search reports by title, description, or reporter email..."
                    containerStyle={{ width: '100%' }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Loading/Error/Content */}
            {loading ? (
              <Sheet variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 8 }}>
                <Stack alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      border: '3px solid',
                      borderColor: 'neutral.300',
                      borderTopColor: 'primary.500',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                  <Typography level="body-md">Loading reports...</Typography>
                </Stack>
              </Sheet>
            ) : error ? (
              <Sheet variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 8, borderColor: 'danger.500' }}>
                <Typography level="body-md" sx={{ color: 'danger.500' }}>
                  Error: {error}
                </Typography>
              </Sheet>
            ) : (
              <Stack spacing={2}>
                <ReportTable 
                  reports={paginatedReports} 
                  onViewDetails={handleViewDetails} 
                  onUpdateStatus={handleUpdateStatus} 
                />
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={handlePageChange} 
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Container>

      {selectedReportForUpdate && (
        <UpdateStatusModal
          open={showUpdateModal}
          onClose={handleCloseUpdateModal}
          report={selectedReportForUpdate}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </>
  );
};

export default ReportManagement;
