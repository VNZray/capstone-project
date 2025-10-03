import React from "react";
import { Button } from "@mui/joy";
import Container from "@/src/components/Container";
import { ListChecks, PlayCircle, PauseCircle, TimerOff } from "lucide-react";

type Status = "All" | "Active" | "Paused" | "Expired";

interface StatusFilterProps {
  active: Status;
  onChange: (status: Status) => void;
}

// Status display metadata (icons/colors geared toward promotions context)
const statuses: {
  label: Status;
  color: "primary" | "success" | "warning" | "neutral" | "danger";
  icon: React.ReactNode;
}[] = [
  { label: "All", color: "primary", icon: <ListChecks size={16} /> },
  { label: "Active", color: "success", icon: <PlayCircle size={16} /> },
  { label: "Paused", color: "warning", icon: <PauseCircle size={16} /> },
  { label: "Expired", color: "neutral", icon: <TimerOff size={16} /> },
];

export default function StatusFilter({ active, onChange }: StatusFilterProps) {
  return (
    <Container direction="row" justify="flex-start" gap="8px">
      {statuses.map((status) => (
        <Button
          key={status.label}
          size="md"
          variant={active === status.label ? "solid" : "outlined"}
          startDecorator={status.icon} // ✅ adds icon before text
          onClick={() => onChange(status.label)}
        >
          {status.label}
        </Button>
      ))}
    </Container>
  );
}
