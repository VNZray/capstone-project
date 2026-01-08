import * as React from "react";
import { Box, Checkbox, Chip, Tooltip, Card } from "@mui/joy";
import Typography from "@/src/components/Typography";
import {
  ShoppingCart,
  Package,
  Wrench,
  Users,
  Heart,
  DollarSign,
  CheckCircle2,
  Circle,
  MinusCircle,
  ChevronRight,
  Shield,
} from "lucide-react";
import type {
  PermissionCategory,
  Permission,
} from "@/src/services/manage-staff/StaffService";

interface PermissionSelectorProps {
  categories: PermissionCategory[];
  selectedPermissions: Set<number>;
  onTogglePermission: (permissionId: number) => void;
  onToggleCategory: (permissions: Permission[]) => void;
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  "Order Management": <ShoppingCart size={18} />,
  "Product Management": <Package size={18} />,
  "Service Management": <Wrench size={18} />,
  "Staff Management": <Users size={18} />,
  "Customer Relations": <Heart size={18} />,
  Financial: <DollarSign size={18} />,
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  "Order Management": "primary",
  "Product Management": "success",
  "Service Management": "warning",
  "Staff Management": "neutral",
  "Customer Relations": "danger",
  Financial: "info",
};

export default function PermissionSelector({
  categories,
  selectedPermissions,
  onTogglePermission,
  onToggleCategory,
}: PermissionSelectorProps) {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    null
  );

  const totalPermissions = categories.reduce(
    (acc, cat) => acc + cat.permissions.length,
    0
  );
  const selectedCount = selectedPermissions.size;

  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || <Shield size={18} />;
  };

  const getCategoryColor = (categoryName: string) => {
    return (categoryColors[categoryName] || "neutral") as any;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header with progress */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderRadius: "12px",
          bgcolor: "background.level1",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: "primary.softBg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield
              size={20}
              style={{ color: "var(--joy-palette-primary-500)" }}
            />
          </Box>
          <Box>
            <Typography.Body weight="semibold" sx={{ fontSize: "14px" }}>
              Permissions
            </Typography.Body>
            <Typography.Body
              size="sm"
              sx={{ color: "text.secondary", fontSize: "12px" }}
            >
              Select permissions for this role
            </Typography.Body>
          </Box>
        </Box>
        <Chip
          size="lg"
          variant="soft"
          color={selectedCount > 0 ? "primary" : "neutral"}
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            minWidth: "70px",
            justifyContent: "center",
          }}
        >
          {selectedCount}/{totalPermissions}
        </Chip>
      </Box>

      {/* Category Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(1, 1fr)" },
          gap: 1.5,
        }}
      >
        {categories.map((category) => {
          const allSelected = category.permissions.every((p) =>
            selectedPermissions.has(p.id)
          );
          const someSelected = category.permissions.some((p) =>
            selectedPermissions.has(p.id)
          );
          const selectedInCategory = category.permissions.filter((p) =>
            selectedPermissions.has(p.id)
          ).length;
          const isExpanded = expandedCategory === category.category_name;
          const categoryColor = getCategoryColor(category.category_name);

          return (
            <Card
              key={category.category_name}
              variant="outlined"
              sx={{
                p: 0,
                overflow: "hidden",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: `${categoryColor}.300`,
                  boxShadow: "sm",
                },
                border: isExpanded ? "2px solid" : "1px solid",
                borderColor: isExpanded ? `${categoryColor}.400` : "divider",
              }}
            >
              {/* Category Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  cursor: "pointer",
                  bgcolor: isExpanded
                    ? `${categoryColor}.softBg`
                    : "transparent",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: `${categoryColor}.softBg`,
                  },
                }}
                onClick={() =>
                  setExpandedCategory(
                    isExpanded ? null : category.category_name
                  )
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flex: 1,
                  }}
                >
                  {/* Category Icon */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "8px",
                      bgcolor: `${categoryColor}.softBg`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ color: `${categoryColor}.500` }}>
                      {getCategoryIcon(category.category_name)}
                    </Box>
                  </Box>

                  {/* Category Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.25,
                      }}
                    >
                      <Typography.Body
                        weight="semibold"
                        sx={{
                          fontSize: "13px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {category.category_name}
                      </Typography.Body>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={
                          selectedInCategory > 0 ? categoryColor : "neutral"
                        }
                        sx={{
                          fontSize: "11px",
                          height: "20px",
                          minHeight: "20px",
                          fontWeight: 600,
                        }}
                      >
                        {selectedInCategory}/{category.permissions.length}
                      </Chip>
                      <Typography.Body
                        size="sm"
                        sx={{ color: "text.tertiary", fontSize: "11px" }}
                      >
                        selected
                      </Typography.Body>
                    </Box>
                  </Box>

                  {/* Select All Checkbox */}
                  <Tooltip
                    title={allSelected ? "Deselect all" : "Select all"}
                    arrow
                    size="sm"
                  >
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCategory(category.permissions);
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        "&:hover": {
                          bgcolor: "background.level2",
                        },
                      }}
                    >
                      {allSelected ? (
                        <CheckCircle2
                          size={18}
                          style={{ color: "var(--joy-palette-success-500)" }}
                        />
                      ) : someSelected ? (
                        <MinusCircle
                          size={18}
                          style={{ color: "var(--joy-palette-warning-500)" }}
                        />
                      ) : (
                        <Circle size={18} style={{ opacity: 0.3 }} />
                      )}
                    </Box>
                  </Tooltip>
                </Box>

                {/* Expand Indicator */}
                <ChevronRight
                  size={16}
                  style={{
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    opacity: 0.5,
                    marginLeft: 8,
                  }}
                />
              </Box>

              {/* Expanded Permission Items */}
              {isExpanded && (
                <Box
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.surface",
                  }}
                >
                  {category.permissions.map((permission, idx) => (
                    <Box
                      key={permission.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.25,
                        pl: 2,
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        borderBottom:
                          idx < category.permissions.length - 1
                            ? "1px solid"
                            : "none",
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: `${categoryColor}.softBg`,
                        },
                      }}
                      onClick={() => onTogglePermission(permission.id)}
                    >
                      <Checkbox
                        checked={selectedPermissions.has(permission.id)}
                        onChange={() => onTogglePermission(permission.id)}
                        size="sm"
                        color={categoryColor}
                        sx={{
                          "--Checkbox-size": "18px",
                        }}
                      />
                      <Tooltip
                        title={permission.description || permission.name}
                        placement="top"
                        arrow
                        size="sm"
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography.Body
                            size="sm"
                            sx={{
                              fontSize: "12px",
                              fontWeight: selectedPermissions.has(permission.id)
                                ? 600
                                : 400,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {permission.name}
                          </Typography.Body>
                          {permission.description && (
                            <Typography.Body
                              size="sm"
                              sx={{
                                color: "text.tertiary",
                                fontSize: "11px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {permission.description}
                            </Typography.Body>
                          )}
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
