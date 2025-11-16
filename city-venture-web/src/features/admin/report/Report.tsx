import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  ListChecks, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  XCircle,
  Search
} from "lucide-react";
import { Input, Chip, Stack } from "@mui/joy";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import InfoCard from "@/src/components/InfoCard";
import Button from "@/src/components/Button";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import DynamicTab from "@/src/components/ui/DynamicTab";
import NoDataFound from "@/src/components/NoDataFound";
import PageContainer from "@/src/components/PageContainer";
import { useNavigate } from "react-router-dom";
import UpdateStatusModal from "@/src/features/admin/report/components/UpdateStatusModal";
import type { Report } from "@/src/types/Report";
import { apiService } from "@/src/utils/api";

const ReportManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReportForUpdate, setSelectedReportForUpdate] = useState<Report | null>(null);

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

  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    { id: "pending", label: "Pending", icon: <Clock size={16} /> },
    { id: "in_progress", label: "In Progress", icon: <PlayCircle size={16} /> },
    { id: "resolved", label: "Resolved", icon: <CheckCircle size={16} /> },
    { id: "rejected", label: "Rejected", icon: <XCircle size={16} /> },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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

  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Filter by tab status
    if (activeTab === "pending") {
      filtered = filtered.filter((report) => 
        ['submitted', 'under_review'].includes(report.status)
      );
    } else if (activeTab === "in_progress") {
      filtered = filtered.filter((report) => report.status === "in_progress");
    } else if (activeTab === "resolved") {
      filtered = filtered.filter((report) => report.status === "resolved");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter((report) => report.status === "rejected");
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.reporter_email && report.reporter_email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by updated_at descending
    return filtered.slice().sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [reports, searchQuery, activeTab]);

  // Stats for dashboard overview
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => ['submitted', 'under_review'].includes(r.status)).length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;
    
    return { total, pending, inProgress, resolved, rejected };
  }, [reports]);

  // Define table columns
  const getStatusColor = (status: string): "primary" | "neutral" | "danger" | "success" | "warning" => {
    switch (status) {
      case 'submitted': return 'neutral';
      case 'under_review': return 'warning';
      case 'in_progress': return 'primary';
      case 'resolved': return 'success';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  };

  const getTargetTypeColor = (targetType: string): "primary" | "neutral" | "danger" | "success" | "warning" => {
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

  const columns: TableColumn<Report>[] = [
    {
      id: "title",
      label: "Report Title",
      minWidth: 250,
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography.Body size="xs" weight="semibold">
            {row.title}
          </Typography.Body>
          <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
            {row.description.length > 50
              ? `${row.description.substring(0, 50)}...`
              : row.description}
          </Typography.Body>
        </Stack>
      ),
    },
    {
      id: "reporter_email",
      label: "Reporter",
      minWidth: 150,
      render: (row) => (
        <Typography.Body size="xs">
          {row.reporter_email || 'Unknown'}
        </Typography.Body>
      ),
    },
    {
      id: "target_type",
      label: "Target",
      minWidth: 150,
      render: (row) => (
        <Stack spacing={0.5}>
          <Chip
            color={getTargetTypeColor(row.target_type)}
            variant="soft"
            size="sm"
          >
            {row.target_type.replace('_', ' ')}
          </Chip>
          {row.target_info && (
            <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
              {row.target_info.name}
            </Typography.Body>
          )}
        </Stack>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      render: (row) => (
        <Chip
          color={getStatusColor(row.status)}
          variant="soft"
          size="sm"
        >
          {row.status.replace('_', ' ')}
        </Chip>
      ),
    },
    {
      id: "created_at",
      label: "Created",
      minWidth: 150,
      render: (row) => (
        <Typography.Body size="xs">
          {formatDate(row.created_at)}
        </Typography.Body>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 180,
      render: (row) => (
        <Stack direction="row" spacing={0.75}>
          <Button
            variant="outlined"
            colorScheme="success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(row);
            }}
          >
            View
          </Button>
          <Button
            variant="outlined"
            colorScheme="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateStatus(row);
            }}
          >
            Update
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* Report Management Header */}
      <Container gap="0" padding="0" elevation={3}>
        <Container padding="16px">
          <Typography.Header>Report Management</Typography.Header>
        </Container>

        {/* Stats Cards */}
        <Container
          direction="row"
          padding="0 16px 16px 16px"
          gap="12px"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          }}
        >
          <InfoCard
            icon={<ListChecks size={24} color="#fff" />}
            title={stats.total.toString()}
            subtitle="Total"
            color="#0A1B47"
          />
          <InfoCard
            icon={<Clock size={24} color="#fff" />}
            title={stats.pending.toString()}
            subtitle="Pending"
            color="#F59E0B"
          />
          <InfoCard
            icon={<PlayCircle size={24} color="#fff" />}
            title={stats.inProgress.toString()}
            subtitle="In Progress"
            color="#3B82F6"
          />
          <InfoCard
            icon={<CheckCircle size={24} color="#fff" />}
            title={stats.resolved.toString()}
            subtitle="Resolved"
            color="#10B981"
          />
          <InfoCard
            icon={<XCircle size={24} color="#fff" />}
            title={stats.rejected.toString()}
            subtitle="Rejected"
            color="#EF4444"
          />
        </Container>

        {/* Search */}
        <Container
          padding="0 20px"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search reports by title, description, or reporter..."
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Container>

        {/* Tabs */}
        <DynamicTab
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(tabId) => {
            setActiveTab(String(tabId));
          }}
        />
      </Container>

      <Container background="transparent" padding="0">
        {loading ? (
          <Container
            align="center"
            justify="center"
            padding="4rem"
            style={{ minHeight: "400px" }}
          >
            <div className="loading-spinner" />
            <Typography.Body size="normal" sx={{ color: "#666", marginTop: "1rem" }}>
              Loading reports...
            </Typography.Body>
          </Container>
        ) : error ? (
          <Container
            align="center"
            justify="center"
            padding="4rem"
            style={{ minHeight: "400px" }}
          >
            <Typography.Body size="normal" sx={{ color: "#ff4d4d" }}>
              Error: {error}
            </Typography.Body>
          </Container>
        ) : reports.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Reports Found"
            message="No reports have been submitted yet."
          />
        ) : filteredReports.length === 0 && searchQuery.trim() !== "" ? (
          <NoDataFound
            icon="search"
            title="No Results Found"
            message={`No reports match "${searchQuery}". Try a different search term.`}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredReports}
            rowKey="id"
            onRowClick={(row) => handleViewDetails(row)}
            rowsPerPage={10}
            loading={loading}
            emptyMessage="No reports found"
            stickyHeader
            maxHeight="600px"
          />
        )}
      </Container>

      {selectedReportForUpdate && (
        <UpdateStatusModal
          open={showUpdateModal}
          onClose={handleCloseUpdateModal}
          report={selectedReportForUpdate}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </PageContainer>
  );
};

export default ReportManagement;
