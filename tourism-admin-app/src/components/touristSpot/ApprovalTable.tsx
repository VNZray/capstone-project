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
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

// Safe extractor for string-like fields coming from loosely-typed API items
const getStr = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

type ApprovalTableItem = Record<string, unknown> & {
  id: string;
  name: string;
  action_type: "new" | "edit";
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
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 12,
          color: "neutral.600",
        }}
        aria-live="polite"
      >
        <Typography level="body-lg">
          No pending {contentType.toLowerCase()} found
        </Typography>
      </Sheet>
    );
  }

  return (
    <Box>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {items.map((itemRaw, idx) => {
          const item = itemRaw as ApprovalTableItem;
          const key = String(item.id ?? idx);

          const submitted = (() => {
            const dateRaw =
              (item.created_at as string) ||
              (item.submitted_at as string) ||
              "";
            if (!dateRaw) return "-";
            const d = new Date(dateRaw);
            return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
          })();

          const description =
            typeof item.description === "string" ? item.description : undefined;

          const isProcessing =
            processingId != null && processingId === String(item.id);
          const i = item as Record<string, unknown>;
          const barangay =
            getStr(i["barangay"]) ?? getStr(i["barangay_name"]) ?? getStr(i["brgy"]);
          const municipality =
            getStr(i["municipality"]) ??
            getStr(i["municipality_name"]) ??
            getStr(i["city"]) ??
            getStr(i["city_name"]);
          const province = getStr(i["province"]) ?? getStr(i["province_name"]);
          const addressParts = [barangay, municipality, province].filter(
            (p): p is string => Boolean(p)
          );
          const address = addressParts.length ? addressParts.join(", ") : undefined;
          const contactNo =
            getStr(i["contact_phone"]) ??
            getStr(i["phone"]) ??
            getStr(i["contact"]) ??
            getStr(i["mobile"]);

          return (
            <Grid key={key} xs={12} sm={6} md={4} lg={3} xl={3}>
              <div className="card-wrapper">
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.18s ease-in-out",
                  width: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack spacing={0.5}>
                      <Typography level="title-md">
                        {String(item.name ?? "-")}
                      </Typography>
                      <Typography
                        level="body-sm"
                        sx={{ color: "text.secondary" }}
                      >
                        Submitted: {submitted}
                      </Typography>
                    </Stack>
                    <Chip
                      size="sm"
                      color={
                        String(item.action_type) === "new"
                          ? "success"
                          : "primary"
                      }
                      variant="solid"
                    >
                      {String(item.action_type) === "new" ? "New" : "Edit"}
                    </Chip>
                  </Stack>

                  {description && (
                    <Typography
                      level="body-sm"
                      sx={{ mt: 1.5, color: "text.tertiary" }}
                    >
                      {description.slice(0, 180)}
                      {description.length > 180 ? "…" : ""}
                    </Typography>
                  )}

                  {address && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                      <PlaceRoundedIcon fontSize="small" />
                      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                        {address}
                      </Typography>
                    </Stack>
                  )}

                  {contactNo && (
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                      <PhoneRoundedIcon fontSize="small" />
                      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                        {contactNo}
                      </Typography>
                    </Stack>
                  )}
                </CardContent>

                <Box sx={{ mt: "auto", px: 2, pb: 2 }}>
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
                        onClick={() => onApprove(String(item.id))}
                        loading={isProcessing}
                        sx={{ flex: "1 1 0%", minWidth: 120 }}
                      >
                        Approve
                      </Button>
                      <Button
                        startDecorator={<CloseRoundedIcon />}
                        color="danger"
                        variant="outlined"
                        onClick={() => onReject(String(item.id))}
                        disabled={isProcessing}
                        sx={{ flex: "1 1 0%", minWidth: 120 }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
              </div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ApprovalTable;
