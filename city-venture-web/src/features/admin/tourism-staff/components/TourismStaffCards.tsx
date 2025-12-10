import React from "react";
import { Typography, Stack, Chip } from "@mui/joy";
import { CheckCircle, MinusCircle, ShieldCheck, ShieldAlert, Briefcase, Mail } from "lucide-react";
import Card from "@/src/components/Card";
import type { TourismStaff } from "@/src/types/TourismStaff";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

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
  if (staff.length === 0) {
    return (
      <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", opacity: 0.8 }}>
        <Typography level="body-md">No staff found</Typography>
      </div>
    );
  }

  return (
    <>
      {staff.map((s) => (
        <Card
          key={s.tourism_id}
          variant="grid"
          image={placeholderImage}
          aspectRatio="16/9"
          title={`${s.first_name} ${s.middle_name || ""} ${s.last_name}`}
          subtitle={s.position || "-"}
          size="default"
          elevation={2}
          actions={[
            {
              label: 'Edit',
              onClick: () => onEdit(s),
              variant: 'outlined',
              colorScheme: 'primary',
              fullWidth: true,
            },
            {
              label: 'Reset Password',
              onClick: () => onResetPassword(s),
              variant: 'outlined',
              colorScheme: 'error',
              fullWidth: true,
            },
          ]}
        >
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <Chip 
                variant="soft" 
                color={s.is_active ? "success" : "neutral"} 
                size="sm" 
                startDecorator={s.is_active ? <CheckCircle size={14} /> : <MinusCircle size={14} /> }
              >
                {s.is_active ? "Active" : "Inactive"}
              </Chip>
              <Chip 
                variant="soft" 
                color={s.is_verified ? "primary" : "warning"} 
                size="sm" 
                startDecorator={s.is_verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} /> }
              >
                {s.is_verified ? "Verified" : "Unverified"}
              </Chip>
            </Stack>

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Mail size={14} style={{ opacity: 0.6 }} />
                <Typography level="body-sm" sx={{ wordBreak: "break-all" }}>{s.email}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Briefcase size={14} style={{ opacity: 0.6 }} />
                <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                  {s.role_name || "-"}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      ))}
    </>
  );
};

export default TourismStaffCards;
