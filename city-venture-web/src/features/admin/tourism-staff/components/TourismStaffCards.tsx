import React from "react";
import { Card, CardContent, Typography, Stack, Chip, Grid } from "@mui/joy";
import { CheckCircle, MinusCircle, ShieldCheck, ShieldAlert, Briefcase, Mail } from "lucide-react";
import Button from "@/src/components/Button";
import type { TourismStaff } from "@/src/types/TourismStaff";

interface TourismStaffCardsProps {
  staff: TourismStaff[];
  onEdit: (s: TourismStaff) => void;
  onResetPassword: (s: TourismStaff) => void;
}

const TourismStaffCards: React.FC<TourismStaffCardsProps> = ({
  staff,
  onEdit,
  onResetPassword,
}) => {
  return (
    <Grid container spacing={2}>
      {staff.map((s) => (
        <Grid key={s.tourism_id} xs={12} sm={6} md={4} lg={3}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography level="title-md" sx={{ fontWeight: 700 }}>
                  {s.first_name} {s.middle_name || ""} {s.last_name}
                </Typography>
                <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                  {s.position || "-"}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Chip variant="soft" color={s.is_active ? "success" : "neutral"} size="sm" startDecorator={s.is_active ? <CheckCircle size={14} /> : <MinusCircle size={14} /> }>
                    {s.is_active ? "Active" : "Inactive"}
                  </Chip>
                  <Chip variant="soft" color={s.is_verified ? "primary" : "warning"} size="sm" startDecorator={s.is_verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} /> }>
                    {s.is_verified ? "Verified" : "Unverified"}
                  </Chip>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Mail size={14} />
                  <Typography level="body-sm">{s.email}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Briefcase size={14} />
                  <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                    {s.role_name || "-"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="sm" variant="outlined" colorScheme="primary" onClick={() => onEdit(s)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outlined" colorScheme="error" onClick={() => onResetPassword(s)}>
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {staff.length === 0 && (
        <Grid xs={12}>
          <Typography level="body-md" sx={{ textAlign: "center", p: 3, opacity: 0.8 }}>
            No staff found
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default TourismStaffCards;
