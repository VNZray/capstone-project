import React, { useEffect, useMemo, useState } from "react";
import { Chip } from "@mui/joy";
import Button from "@/src/components/Button";
import type { Report } from "@/src/types/Report";
import { apiService } from "@/src/utils/api";
import Table, { type TableColumn } from "@/src/components/ui/Table";

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

  const columns: TableColumn<Report & { target_info?: { name: string; type: string } }>[] = useMemo(() => [
    {
      id: "title",
      label: "Report Title",
      minWidth: 220,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>{row.title}</span>
          <span style={{ opacity: 0.7, fontSize: 12 }}>
            {row.description.length > 50
              ? `${row.description.substring(0, 50)}...`
              : row.description}
          </span>
        </div>
      ),
    },
    {
      id: "reporter_email",
      label: "Reporter",
      minWidth: 160,
      render: (_row, val) => <span>{val || "Unknown"}</span>,
    },
    {
      id: "target_type",
      label: "Target",
      minWidth: 160,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Chip color={getTargetTypeColor(row.target_type)} size="sm" variant="soft">
            {row.target_info?.type || row.target_type.replace("_", " ")}
          </Chip>
          <span style={{ opacity: 0.7, fontSize: 12 }}>
            {row.target_info?.name || row.target_id}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      render: (row) => (
        <Chip color={getStatusColor(row.status)} size="sm" variant="soft">
          {row.status.replace("_", " ")}
        </Chip>
      ),
    },
    {
      id: "created_at",
      label: "Created",
      minWidth: 160,
      render: (_row, val) => <span style={{ fontSize: 12 }}>{formatDate(val)}</span>,
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 180,
      render: (row) => (
        <div style={{ display: "flex", gap: 8, whiteSpace: "nowrap" }}>
          <Button size="sm" variant="outlined" colorScheme="success" onClick={() => onViewDetails(row)}>
            View
          </Button>
          <Button size="sm" variant="outlined" colorScheme="primary" onClick={() => onUpdateStatus(row)}>
            Update
          </Button>
        </div>
      ),
    },
  ], [onUpdateStatus, onViewDetails]);

  if (loading) {
    return (
      <Table columns={columns} data={[]} loading radius="12px" />
    );
  }

  return (
    <Table
      columns={columns}
      data={reportsWithTargetInfo}
      rowsPerPage={10}
      emptyMessage="No reports found"
      radius="12px"
    />
  );
};

export default ReportTable;
