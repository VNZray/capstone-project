import React from "react";
import { Select, Option, FormControl, FormLabel, Stack } from "@mui/joy";
import { IoRefresh } from "react-icons/io5";
import Button from "@/src/components/Button";

interface StaffFiltersProps {
  selectedStatus: string;
  selectedRole: string;
  onStatusChange: (status: string) => void;
  onRoleChange: (role: string) => void;
  onRefresh: () => void;
  roleOptions?: string[]; // optional dynamic list
}

const StaffFilters: React.FC<StaffFiltersProps> = ({
  selectedStatus,
  selectedRole,
  onStatusChange,
  onRoleChange,
  onRefresh,
  roleOptions,
}) => {
  const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
  ];

  // Roles can be provided dynamically; fallback to common tourism roles
  const computedRoles = ["All", ...(roleOptions && roleOptions.length ? roleOptions : ["Admin", "Tourism Officer"])];

  return (
    <Stack direction="row" spacing={2} alignItems="flex-end">
      <FormControl size="sm" sx={{ minWidth: 120 }}>
        <FormLabel>Status</FormLabel>
        <Select
          value={selectedStatus}
          onChange={(_, value) => onStatusChange((value as string) ?? "All")}
          size="sm"
        >
          {statusOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl size="sm" sx={{ minWidth: 160 }}>
        <FormLabel>Role</FormLabel>
        <Select
          value={selectedRole}
          onChange={(_, value) => onRoleChange((value as string) ?? "All")}
          size="sm"
        >
          {computedRoles.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        size="sm"
        startDecorator={<IoRefresh />}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </Stack>
  );
};

export default StaffFilters;
