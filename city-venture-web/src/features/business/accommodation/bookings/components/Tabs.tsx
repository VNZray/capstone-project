import React from "react";
import { Button } from "@mui/joy";
import Container from "@/src/components/Container";
import { Star, ListChecks, Image } from "lucide-react";

type tabs = "All" | "Pending" | "Reserved" | "Checked-in" | "Checked-out" | "Cancelled";

interface tabsFilter {
  active: tabs;
  onChange: (tab: tabs) => void;
}

const tabs: {
  label: tabs;
  icon: React.ReactNode;
}[] = [
  { label: "All", icon: <ListChecks size={16} /> },
  { label: "Pending", icon: <Image size={16} /> },
  { label: "Reserved", icon: <Star size={16} /> },
  { label: "Checked-in", icon: <ListChecks size={16} /> },
  { label: "Checked-out", icon: <Image size={16} /> },
  { label: "Cancelled", icon: <Star size={16} /> },
];

export default function Tabs({ active, onChange }: tabsFilter) {
  return (
    <Container direction="row" justify="flex-start" gap="8px">
      {tabs.map((tab) => (
        <Button
          key={tab.label}
          size="md"
          variant={active === tab.label ? "solid" : "outlined"}
          startDecorator={tab.icon}
          onClick={() => onChange(tab.label)}
        >
          {tab.label}
        </Button>
      ))}
    </Container>
  );
}
