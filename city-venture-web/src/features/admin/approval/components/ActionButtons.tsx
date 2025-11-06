import React from "react";
import { Button, Stack } from "@mui/joy";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { ApprovalTableItem } from "@/src/types/approval";

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
        <Button
          startDecorator={<VisibilityRoundedIcon />}
          variant="soft"
          color="primary"
          onClick={() => onView(item)}
          sx={{ width: "100%" }}
        >
          View Details
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            startDecorator={<CheckRoundedIcon />}
            color="success"
            onClick={() => onApprove(id)}
            loading={isProcessing}
            sx={{ flex: "1 1 0%", minWidth: 120 }}
          >
            Approve
          </Button>
          <Button
            startDecorator={<CloseRoundedIcon />}
            color="danger"
            variant="outlined"
            onClick={() => onReject(id)}
            disabled={isProcessing}
            sx={{ flex: "1 1 0%", minWidth: 120 }}
          >
            Reject
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default ActionButtons;
