import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dropdown,
  MenuButton,
} from "@mui/joy";
import { FileText, MoreVertical, Upload, Trash2 } from "lucide-react";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import { useState } from "react";
import { MoreVert } from "@mui/icons-material";
import Container from "@/src/components/Container";

interface FileItemProps {
  fileName: string;
  status: "pending" | "approved" | "rejected";
  statusLabel?: string;
  dateUploaded: string;
  dateApproved?: string;
  isExpired?: boolean;
  statusColor?: "danger" | "success" | "warning" | "neutral";
  onClick: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

const FileItem = ({
  fileName,
  status,
  statusLabel,
  dateUploaded,
  dateApproved,
  isExpired = false,
  statusColor = "neutral",
  onClick,
  onUpdate,
  onDelete,
}: FileItemProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    onUpdate();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    onDelete();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: isExpired ? `2px solid ${colors.error}` : "1px solid #e0e0e0",
        gap: 2,
        p: 2,
        backgroundColor: colors.background,
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: colors.white + "10",
          borderColor: colors.primary,
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          flex: 1,
        }}
      >
        {/* File Icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "8px",
            backgroundColor: colors.primary + "20",
            marginRight: 2,
          }}
        >
          <FileText size={24} color={colors.primary} />
        </Box>

        {/* File Info */}
        <Box sx={{ flex: 1, minWidth: 0, }}>
          {/* File Name and Status */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.5,
            }}
          >
            <Typography.Label
              size="sm"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fileName}
            </Typography.Label>
            <Chip size="sm" color={statusColor} variant="soft">
              {statusLabel || status.charAt(0).toUpperCase() + status.slice(1)}
            </Chip>
          </Box>

          {/* Date Uploaded */}
          <Typography.Body size="xs" color="default">
            Uploaded: {dateUploaded}
          </Typography.Body>
        </Box>

        {/* Date Approved */}
        {dateApproved && (
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              alignItems: "flex-end",
              mr: 2,
            }}
          >
            <Typography.Body size="xs" color="default">
              {dateApproved}
            </Typography.Body>
            <Typography.Body size="xs" color="default" sx={{ opacity: 0.7 }}>
              Date approved
            </Typography.Body>
          </Box>
        )}
      </Box>

      <Box>
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: "outlined", color: "neutral" } }}
          >
            <MoreVert />
          </MenuButton>
          <Menu>
            <MenuItem onClick={handleUpdate}>
              <Upload size={16} style={{ marginRight: 8 }} />
              Update
            </MenuItem>
            <MenuItem onClick={handleDelete} color="danger">
              <Trash2 size={16} style={{ marginRight: 8 }} />
              Delete
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  );
};

export default FileItem;
