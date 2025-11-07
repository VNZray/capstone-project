import React from "react";
import { Stack } from "@mui/joy";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { ApprovalTableItem } from "@/src/types/approval";
import ResponsiveButton from "@/src/components/ResponsiveButton";

interface ActionButtonsProps {
  item: ApprovalTableItem;
  onView: (item: ApprovalTableItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  item,
  onView,
  onApprove,
  onReject,
  isProcessing,
}) => {
  const id = String(item.id ?? "");
  return (
    <div style={{ paddingTop: 8 }}>
      <Stack spacing={1}>
        <ResponsiveButton
          startIcon={<VisibilityRoundedIcon />}
          variant="solid"
          color="primary"
          onClick={() => onView(item)}
          fullWidth
          hoverEffect="lift"
          size="sm"
        >
          View Details
        </ResponsiveButton>

        <Stack direction="row" spacing={1}>
          <ResponsiveButton
            startIcon={<CheckRoundedIcon />}
            color="success"
            onClick={() => onApprove(id)}
            loading={isProcessing}
            style={{ flex: "1 1 0%", minWidth: 120 }}
            hoverEffect="lift"
            size="sm"
          >
            Approve
          </ResponsiveButton>
          <ResponsiveButton
            startIcon={<CloseRoundedIcon />}
            color="error"
            variant="outlined"
            onClick={() => onReject(id)}
            disabled={isProcessing}
            style={{ flex: "1 1 0%", minWidth: 120 }}
            hoverEffect="lift"
            size="sm"
          >
            Reject
          </ResponsiveButton>
        </Stack>
      </Stack>
    </div>
  );
};

export default ActionButtons;
