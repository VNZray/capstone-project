/**
 * RoleList Component (Tourism)
 *
 * Displays a list of tourism staff roles with actions for editing and deleting.
 * Shows role details including permission count and user count.
 */

import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import { Edit, Trash2, Users, Shield } from "lucide-react";
import type { Role } from "@/src/services/RoleService";
import {
  canEditRole,
  canDeleteRole,
  getRoleTypeLabel,
  getRoleTypeColor,
} from "@/src/services/RoleService";

interface RoleListProps {
  roles: Role[];
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  onViewDetails?: (role: Role) => void;
  isLoading?: boolean;
}

export function RoleList({
  roles,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading,
}: RoleListProps) {
  if (isLoading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="outlined" sx={{ opacity: 0.5 }}>
            <CardContent>
              <Box
                sx={{ height: 60, bgcolor: "neutral.100", borderRadius: "sm" }}
              />
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  if (roles.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Shield size={48} style={{ opacity: 0.3, marginBottom: 8 }} />
          <Typography level="body-md" color="neutral">
            No roles configured yet
          </Typography>
          <Typography level="body-sm" color="neutral">
            Create a role from a template or build a custom one
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </Stack>
  );
}

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  onViewDetails?: (role: Role) => void;
}

function RoleCard({ role, onEdit, onDelete, onViewDetails }: RoleCardProps) {
  const editable = canEditRole(role);
  const deletable = canDeleteRole(role);

  return (
    <Card
      variant="outlined"
      sx={{
        cursor: onViewDetails ? "pointer" : "default",
        "&:hover": onViewDetails
          ? { borderColor: "primary.300", bgcolor: "primary.50" }
          : {},
        transition: "all 0.2s",
      }}
      onClick={() => onViewDetails?.(role)}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography level="title-md">{role.role_name}</Typography>
              <Chip
                size="sm"
                variant="soft"
                color={getRoleTypeColor(role.role_type)}
              >
                {role.is_custom
                  ? "Custom"
                  : role.based_on_name
                  ? `From ${role.based_on_name}`
                  : getRoleTypeLabel(role.role_type)}
              </Chip>
            </Stack>

            {role.role_description && (
              <Typography level="body-sm" color="neutral" mb={1}>
                {role.role_description}
              </Typography>
            )}

            <Stack direction="row" spacing={2}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Shield size={14} />
                <Typography level="body-xs" color="neutral">
                  {role.permission_count ?? 0} permissions
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Users size={14} />
                <Typography level="body-xs" color="neutral">
                  {role.user_count ?? 0} users
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.5}>
            {editable && onEdit && (
              <Tooltip title="Edit Role">
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(role);
                  }}
                >
                  <Edit size={16} />
                </IconButton>
              </Tooltip>
            )}
            {deletable && onDelete && (
              <Tooltip title="Delete Role">
                <IconButton
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(role);
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default RoleList;
