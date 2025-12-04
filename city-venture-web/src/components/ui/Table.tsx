import React, { useState, useMemo } from "react";
import { Chip } from "@mui/joy";
import Container from "../Container";
import Typography from "../Typography";
import { Box } from "@mui/joy";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../Button";
import { colors } from "@/src/utils/Colors";

type ChipColor = "primary" | "neutral" | "danger" | "success" | "warning";

// Guest Info Interface
export interface GuestInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  userProfile?: string;
}

// Column Definition
export interface TableColumn<T = any> {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "center" | "right";
  render?: (row: T, value: any) => React.ReactNode;
  format?: (value: any) => string;
}

// Table Props
export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  rowsPerPage?: number;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: keyof T | ((row: T) => string | number);
  emptyMessage?: string;
  loading?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
  oddRowColor?: string;
  evenRowColor?: string;
  hoverColor?: string;
  radius?: string;
}

// Guest Avatar Component
interface GuestAvatarProps {
  guest: GuestInfo;
  size?: number;
}

const GuestAvatar: React.FC<GuestAvatarProps> = ({ guest, size = 40 }) => {
  const [imageError, setImageError] = useState(false);

  const fullName = [guest.firstName, guest.middleName, guest.lastName]
    .filter(Boolean)
    .join(" ");

  const initials = [guest.firstName, guest.lastName]
    .filter(Boolean)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const hasImage = guest.userProfile && !imageError;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Avatar */}
      {hasImage ? (
        <img
          src={guest.userProfile}
          alt={fullName}
          onError={() => setImageError(true)}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #E5E7EB",
          }}
        />
      ) : (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: colors.primary,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: size * 0.4,
            border: "2px solid #E5E7EB",
          }}
        >
          {initials || "?"}
        </Box>
      )}

      {/* Name */}
      <Box>
        <Typography.Body weight="semibold">
          {fullName || "Unknown"}
        </Typography.Body>
      </Box>
    </Box>
  );
};

// Status Chip Component
interface StatusChipProps {
  status: string;
  colorMap?: Record<string, ChipColor>;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, colorMap }) => {
  const defaultColorMap: Record<string, ChipColor> = {
    pending: "warning",
    reserved: "primary",
    "checked-in": "warning",
    "checked-out": "success",
    canceled: "danger",
    active: "success",
    inactive: "neutral",
    completed: "success",
    failed: "danger",
  };

  const finalColorMap = { ...defaultColorMap, ...colorMap };
  const color = finalColorMap[status.toLowerCase()] || "neutral";

  return (
    <Chip color={color} size="md" variant="soft">
      {status}
    </Chip>
  );
};

// Main Table Component
function Table<T extends Record<string, any>>({
  columns,
  data,
  rowsPerPage = 10,
  onRowClick,
  rowKey,
  emptyMessage = "No data available",
  loading = false,
  stickyHeader = true,
  maxHeight = "600px",
  oddRowColor = "#F9FAFB",
  evenRowColor = "#FFFFFF",
  hoverColor = "#E5E7EB",
}: TableProps<T>) {
  const [page, setPage] = useState(0);

  // Get unique row key
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    if (rowKey) {
      return row[rowKey];
    }
    return index;
  };

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  // Render cell content
  const renderCell = (column: TableColumn<T>, row: T) => {
    const value = row[column.id];

    // Custom render function
    if (column.render) {
      return column.render(row, value);
    }

    // Format function
    if (column.format) {
      return column.format(value);
    }

    // Default rendering - wrap in Typography only for primitive values
    return <Typography.Body>{value ?? "—"}</Typography.Body>;
  };

  return (
    <Container
      gap="0"
      padding="0"
      elevation={2}
      radius="8px"
      style={{ overflow: "hidden" }}
    >
      {/* Table Container */}
      <Box
        sx={{
          width: "100%",
          overflow: "auto",
          maxHeight: maxHeight,
          position: "relative",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
          }}
        >
          {/* Table Header */}
          <thead
            style={{
              position: stickyHeader ? "sticky" : "static",
              top: 0,
              zIndex: 10,
              backgroundColor: colors.primary,
            }}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{
                    padding: "16px",
                    textAlign: column.align || "left",
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    borderBottom: `2px solid ${colors.primary}`,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Box>
                    <Typography.Label>{column.label}</Typography.Label>
                  </Box>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: "40px", textAlign: "center" }}
                >
                  <Typography.Body>Loading...</Typography.Body>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: "40px", textAlign: "center" }}
                >
                  <Typography.Body>{emptyMessage}</Typography.Body>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const actualIndex = page * rowsPerPage + rowIndex;
                const isOdd = actualIndex % 2 !== 0;

                return (
                  <tr
                    key={getRowKey(row, actualIndex)}
                    onClick={() => onRowClick?.(row, actualIndex)}
                    style={{
                      backgroundColor: isOdd ? oddRowColor : evenRowColor,
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (onRowClick) {
                        e.currentTarget.style.backgroundColor = hoverColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isOdd
                        ? oddRowColor
                        : evenRowColor;
                    }}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        style={{
                          padding: "16px",
                          textAlign: column.align || "left",
                          borderBottom: "1px solid #E5E7EB",
                        }}
                      >
                        <Typography.Body>
                          {renderCell(column, row)}
                        </Typography.Body>
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px"
          gap="16px"
          style={{ borderTop: "1px solid #E5E7EB" }}
        >
          <Typography.Body>
            Showing {page * rowsPerPage + 1} to{" "}
            {Math.min((page + 1) * rowsPerPage, data.length)} of {data.length}{" "}
            entries
          </Typography.Body>

          <Box
            sx={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              colorScheme="primary"
              onClick={handlePrevPage}
              disabled={page === 0}
              startDecorator={<ChevronLeft size={16} />}
              size="sm"
            >
              Previous
            </Button>

            <Typography.Label margin={0}>
              Page {page + 1} of {totalPages}
            </Typography.Label>

            <Button
              variant="outlined"
              colorScheme="primary"
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
              endDecorator={<ChevronRight size={16} />}
              size="sm"
            >
              Next
            </Button>
          </Box>
        </Container>
      )}
    </Container>
  );
}

// Export components
export default Table;
export { GuestAvatar, StatusChip };
export type { GuestAvatarProps, StatusChipProps };
