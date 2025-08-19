import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  Sheet,
} from "@mui/joy";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

type ApprovalTableItem = Record<string, unknown> & {
  id: string;
  name: string;
  action_type: 'new' | 'edit';
  submitted_at?: string;
  created_at?: string;
  description?: string;
};

interface ApprovalTableProps {
  items: unknown[];
  contentType: string;
  onView: (item: ApprovalTableItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processingId?: string | null;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({
  items,
  contentType,
  onView,
  onApprove,
  onReject,
  processingId,
}) => {
  if (items.length === 0) {
    return (
      <Sheet
        variant="soft"
        sx={{ p: 4, textAlign: "center", borderRadius: 12, color: "neutral.600" }}
        aria-live="polite"
      >
        <Typography level="body-lg">No pending {contentType.toLowerCase()} found</Typography>
      </Sheet>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        {items.map((itemRaw, idx) => {
          const item = itemRaw as ApprovalTableItem;
          const key = String(item.id ?? idx);

          const submitted = (() => {
            const dateRaw = (item.created_at as string) || (item.submitted_at as string) || "";
            if (!dateRaw) return "-";
            const d = new Date(dateRaw);
            return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
          })();

          const description = typeof item.description === "string" ? item.description : undefined;

          const isProcessing = processingId != null && processingId === String(item.id);

          return (
            <Grid key={key} xs={12} md={6} lg={4}>
              <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Stack spacing={0.5}>
                      <Typography level="title-md">{String(item.name ?? "-")}</Typography>
                      <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                        Submitted: {submitted}
                      </Typography>
                    </Stack>
                    <Chip
                      size="sm"
                      color={String(item.action_type) === "new" ? "success" : "primary"}
                      variant="solid"
                    >
                      {String(item.action_type) === "new" ? "New" : "Edit"}
                    </Chip>
                  </Stack>

          {description && (
                    <Typography level="body-sm" sx={{ mt: 1.5, color: "text.tertiary" }}>
            {description.slice(0, 180)}
            {description.length > 180 ? "…" : ""}
                    </Typography>
                  )}
                </CardContent>

                <Box sx={{ mt: "auto", px: 2, pb: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      startDecorator={<VisibilityRoundedIcon />}
                      variant="soft"
                      color="primary"
                      onClick={() => onView(item)}
                    >
                      View Details
                    </Button>
                    <Button
                      startDecorator={<CheckRoundedIcon />}
                      color="success"
                      onClick={() => onApprove(String(item.id))}
                      loading={isProcessing}
                    >
                      Approve
                    </Button>
                    <Button
                      startDecorator={<CloseRoundedIcon />}
                      color="danger"
                      variant="outlined"
                      onClick={() => onReject(String(item.id))}
                      disabled={isProcessing}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ApprovalTable;
