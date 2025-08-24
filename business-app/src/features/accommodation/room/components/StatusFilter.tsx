import React from "react";
import { Button } from "@mui/joy";
import Container from "@/src/components/Container";
import { Bed, Key, Ban, Wrench, ListChecks } from "lucide-react"; // ✅ example icons

type Status = "All" | "Available" | "Checked-in" | "Cancelled" | "Maintenance";

interface StatusFilterProps {
  active: Status;
  onChange: (status: Status) => void;
}

// 👇 added icon property to each status
const statuses: {
  label: Status;
  color: "primary" | "success" | "warning" | "danger" | "neutral";
  icon: React.ReactNode;
}[] = [
  { label: "All", color: "primary", icon: <ListChecks size={16} /> },
  { label: "Available", color: "success", icon: <Bed size={16} /> },
  { label: "Checked-in", color: "warning", icon: <Key size={16} /> },
  { label: "Cancelled", color: "danger", icon: <Ban size={16} /> },
  { label: "Maintenance", color: "neutral", icon: <Wrench size={16} /> },
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
