import React from "react";
import { Button } from "@mui/joy";
import Container from "@/src/components/Container";
import { Bed, Key, Wrench, ListChecks } from "lucide-react";

type tabs = "Details" | "Photos" | "Occupied" | "Maintenance";

interface tabsFilter {
  active: tabs;
  onChange: (tab: tabs) => void;
}

// 👇 added icon property to each tab
const tabs: {
  label: tabs;
  color: "primary" | "success" | "warning" | "neutral";
  icon: React.ReactNode;
}[] = [
  { label: "Details", color: "primary", icon: <ListChecks size={16} /> },
  { label: "Photos", color: "success", icon: <Bed size={16} /> },
  { label: "Occupied", color: "warning", icon: <Key size={16} /> },
  { label: "Maintenance", color: "neutral", icon: <Wrench size={16} /> },
];

export default function Tabs({ active, onChange }: tabsFilter) {
  return (
    <Container direction="row" justify="flex-start" gap="8px">
      {tabs.map((tab) => (
        <Button
          key={tab.label}
          size="md"
          variant={active === tab.label ? "solid" : "outlined"}
          startDecorator={tab.icon} // ✅ adds icon before text
          onClick={() => onChange(tab.label)}
        >
          {tab.label}
        </Button>
      ))}
    </Container>
  );
}
