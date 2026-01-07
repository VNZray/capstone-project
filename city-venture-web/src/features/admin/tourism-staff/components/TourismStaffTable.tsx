import React, { useMemo } from "react";
import { Chip, Stack } from "@mui/joy";
import { CheckCircle, MinusCircle, ShieldCheck, ShieldAlert, Briefcase, Mail, Trash2 } from "lucide-react";
import Button from "@/src/components/Button";
import type { TourismStaff } from "@/src/types/TourismStaff";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import Typography from "@/src/components/Typography";
import IconButton from "@/src/components/IconButton";

interface TourismStaffTableProps {
  staff: TourismStaff[];
  onEdit: (s: TourismStaff) => void;
  onResetPassword: (s: TourismStaff) => void;
  onDelete: (s: TourismStaff) => void;
}

const TourismStaffTable: React.FC<TourismStaffTableProps> = ({
  staff,
  onEdit,
  onResetPassword,
  onDelete,
}) => {
  const getStatusColor = (s: TourismStaff) => (s.is_active ? "success" : "neutral");
  const getVerifiedColor = (s: TourismStaff) => (s.is_verified ? "primary" : "warning");

  // Removed created_at display to enforce single-line compact rows.

  const columns: TableColumn<TourismStaff>[] = useMemo(() => [
    {
      id: "name",
      label: "Name",
      minWidth: 260,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.Body weight="semibold">
            {row.last_name}, {row.first_name} {row.middle_name || ''}
          </Typography.Body>
          {row.position && (
            <Typography.Body size="xs" sx={{ opacity: 0.6, whiteSpace: 'nowrap' }}>
              • {row.position}
            </Typography.Body>
          )}
        </div>
      ),
    },
    {
      id: "email",
      label: "Email",
      minWidth: 220,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mail size={14} />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      id: "role_name",
      label: "Role",
      minWidth: 160,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={14} />
          <span>{row.role_name || '-'}</span>
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 220,
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Chip color={getStatusColor(row)} variant="soft" size="sm" startDecorator={row.is_active ? <CheckCircle size={14} /> : <MinusCircle size={14} /> }>
            {row.is_active ? 'Active' : 'Inactive'}
          </Chip>
          <Chip color={getVerifiedColor(row)} variant="soft" size="sm" startDecorator={row.is_verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} /> }>
            {row.is_verified ? 'Verified' : 'Unverified'}
          </Chip>
        </Stack>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 200,
      render: (row) => (
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
          <Button size="sm" variant="outlined" colorScheme="primary" onClick={() => onEdit(row)} sx={{ minWidth: 56, px: 1.5 }}>
            Edit
          </Button>
          <Button size="sm" variant="outlined" colorScheme="warning" onClick={() => onResetPassword(row)} sx={{ minWidth: 54, px: 1.5 }}>
            Reset
          </Button>
          <IconButton size="sm" variant="plain" colorScheme="error" onClick={() => onDelete(row)}>
            <Trash2 size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ], [onEdit, onResetPassword, onDelete]);

  return (
    <Table
      columns={columns}
      data={staff}
      rowsPerPage={10}
      emptyMessage="No staff found"
      radius="12px"
      rowKey={(r) => r.tourism_id}
    />
  );
};

export default TourismStaffTable;
