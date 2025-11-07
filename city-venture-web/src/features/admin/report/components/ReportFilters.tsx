import React from "react";
import { Select, Option, FormControl, FormLabel, Stack } from "@mui/joy";
import { IoRefresh } from "react-icons/io5";
import ResponsiveButton from "@/src/components/ResponsiveButton";

interface ReportFiltersProps {
  selectedStatus: string;
  selectedTargetType: string;
  onStatusChange: (status: string) => void;
  onTargetTypeChange: (targetType: string) => void;
  onRefresh: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedStatus,
  selectedTargetType,
  onStatusChange,
  onTargetTypeChange,
  onRefresh,
}) => {
  const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
  ];

  const targetTypeOptions = [
    { value: "All", label: "All Types" },
    { value: "business", label: "Business" },
    { value: "event", label: "Event" },
    { value: "tourist_spot", label: "Tourist Spot" },
    { value: "accommodation", label: "Accommodation" },
  ];

  return (
    <Stack direction="row" spacing={2} alignItems="flex-end">
      <FormControl size="sm" sx={{ minWidth: 120 }}>
        <FormLabel>Status</FormLabel>
        <Select
          value={selectedStatus}
          onChange={(_, value) => onStatusChange(value as string)}
          size="sm"
        >
          {statusOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl size="sm" sx={{ minWidth: 120 }}>
        <FormLabel>Target Type</FormLabel>
        <Select
          value={selectedTargetType}
          onChange={(_, value) => onTargetTypeChange(value as string)}
          size="sm"
        >
          {targetTypeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      <ResponsiveButton
        variant="outlined"
        size="sm"
        startIcon={<IoRefresh />}
        onClick={onRefresh}
        hoverEffect="lift"
      >
        Refresh
      </ResponsiveButton>
    </Stack>
  );
};

export default ReportFilters;
