import React from "react";
import { Stack } from "@mui/joy";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { ApprovalTableItem } from "@/src/types/approval";
import Button from "@/src/components/Button";

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
          variant="solid"
            colorScheme="primary"
          onClick={() => onView(item)}
          fullWidth
          size="sm"
        >
          View Details
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            startDecorator={<CheckRoundedIcon />}
            colorScheme="success"
            onClick={() => onApprove(id)}
            loading={isProcessing}
            sx={{ flex: "1 1 0%", minWidth: 120 }}
            size="sm"
          >
            Approve
          </Button>
          <Button
            startDecorator={<CloseRoundedIcon />}
            colorScheme="error"
            variant="outlined"
            onClick={() => onReject(id)}
            disabled={isProcessing}
            sx={{ flex: "1 1 0%", minWidth: 120 }}
            size="sm"
          >
            Reject
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default ActionButtons;
