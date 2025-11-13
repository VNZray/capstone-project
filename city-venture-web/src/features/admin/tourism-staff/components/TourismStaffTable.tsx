import React from "react";
import { Typography, Chip, Stack, Sheet, Grid } from "@mui/joy";
import { CheckCircle, MinusCircle, ShieldCheck, ShieldAlert, Briefcase, Mail } from "lucide-react";
import Button from "@/src/components/Button";
import type { TourismStaff } from "@/src/types/TourismStaff";

interface TourismStaffTableProps {
  staff: TourismStaff[];
  onEdit: (s: TourismStaff) => void;
  onResetPassword: (s: TourismStaff) => void;
}

const TourismStaffTable: React.FC<TourismStaffTableProps> = ({
  staff,
  onEdit,
  onResetPassword,
}) => {
  const getStatusColor = (s: TourismStaff) => (s.is_active ? "success" : "neutral");
  const getVerifiedColor = (s: TourismStaff) => (s.is_verified ? "primary" : "warning");

  // Removed created_at display to enforce single-line compact rows.

  return (
    <Stack spacing={1}>
      <Sheet
        variant="outlined"
        sx={{ p: 1, backgroundColor: "#0A1B47", borderRadius: 8 }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={3}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>
              Name
            </Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>
              Email
            </Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>
              Role
            </Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>
              Status
            </Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>
              Actions
            </Typography>
          </Grid>
        </Grid>
      </Sheet>

      {staff.map((s) => (
        <Sheet
          key={s.tourism_id}
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: "#fff",
            borderRadius: 8,
            "&:hover": { backgroundColor: "#f8f9fa" },
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={3}>
              <Typography level="body-md" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                {s.last_name}, {s.first_name} {s.middle_name || ""}
                <Typography
                  component="span"
                  level="body-sm"
                  sx={{ opacity: 0.6, fontWeight: 400, ml: 1, whiteSpace: 'nowrap' }}
                >
                  {s.position ? `• ${s.position}` : ''}
                </Typography>
              </Typography>
            </Grid>
            <Grid xs={12} sm={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Mail size={14} />
                <Typography level="body-md">{s.email}</Typography>
              </Stack>
            </Grid>
            <Grid xs={12} sm={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Briefcase size={14} />
                <Typography level="body-md">{s.role_name || "-"}</Typography>
              </Stack>
            </Grid>
            <Grid xs={12} sm={2}>
              <Stack direction="row" spacing={1}>
                  <Chip color={getStatusColor(s)} variant="soft" size="sm" startDecorator={s.is_active ? <CheckCircle size={14} /> : <MinusCircle size={14} /> }>
                    {s.is_active ? "Active" : "Inactive"}
                  </Chip>
                  <Chip color={getVerifiedColor(s)} variant="soft" size="sm" startDecorator={s.is_verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} /> }>
                    {s.is_verified ? "Verified" : "Unverified"}
                  </Chip>
              </Stack>
            </Grid>
            <Grid xs={12} sm={2} md={3} lg={3}>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
                <Button size="sm" variant="outlined" colorScheme="primary" onClick={() => onEdit(s)} sx={{ minWidth: 56, px: 1.5 }}>
                  Edit
                </Button>
                <Button size="sm" variant="outlined" colorScheme="error" onClick={() => onResetPassword(s)} sx={{ minWidth: 54, px: 1.5 }}>
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Sheet>
      ))}

      {staff.length === 0 && (
        <Sheet
          variant="outlined"
          sx={{ p: 4, textAlign: "center", borderRadius: 8, borderStyle: "dashed" }}
        >
          <Typography level="body-md">No staff found</Typography>
        </Sheet>
      )}
    </Stack>
  );
};

export default TourismStaffTable;
