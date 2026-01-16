import React from "react";

import Container from "@/src/components/Container";
import { Star, ListChecks, Image } from "lucide-react";
import Button from "./Button";

type tabs = "Details" | "Photos" | "Reviews";

interface tabsFilter {
  active: tabs;
  onChange: (tab: tabs) => void;
}

const tabs: {
  label: tabs;
  icon: React.ReactNode;
}[] = [
  { label: "Details", icon: <ListChecks size={16} /> }, // checklist for details
  { label: "Photos", icon: <Image size={16} /> }, // image icon for photos
  { label: "Reviews", icon: <Star size={16} /> }, // star for reviews
];

export default function Tabs({ active, onChange }: tabsFilter) {
  return (
    <Container direction="row" justify="flex-start" gap="8px">
      {tabs.map((tab) => (
        <Button
          key={tab.label}
          colorScheme="primary"
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
