import React from "react";
import { Card, CardContent, Typography, Stack, Chip, Button, Divider } from "@mui/joy";
import "../styles/OverviewCard.css";

interface OverviewCardProps {
  title: string;
  count: number;
  icon: string;
  items: Array<{
    id: string;
    name: string;
    action_type: "new" | "edit";
  }>;
  onApprove?: (id: string) => void;
  onView?: (item: { id: string; name: string; action_type: "new" | "edit" }) => void;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  count,
  icon,
  items,
  onApprove,
  onView,
}) => {
  // reference onApprove to avoid 'declared but never read' TypeScript error in some strict configs
  void onApprove;

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <span className="overview-icon" aria-hidden>{icon}</span>
            <Typography level="title-md">{title}</Typography>
          </Stack>
          <Chip variant="solid" color="primary" size="sm">{count}</Chip>
        </Stack>
        <Divider />
        {count > 0 ? (
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {items.slice(0, 3).map((item) => (
              <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="sm" variant="soft" color={item.action_type === "new" ? "success" : "primary"}>
                    {item.action_type === "new" ? "New" : "Edit"}
                  </Chip>
                  <Typography level="body-md">{item.name}</Typography>
                </Stack>
                {onView && (
                  <Button size="sm" variant="soft" onClick={() => onView(item)}>View</Button>
                )}
              </Stack>
            ))}
            {count > 3 && (
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>+{count - 3} more items</Typography>
            )}
          </Stack>
        ) : (
          <Typography level="body-sm" sx={{ mt: 1.5, color: "text.tertiary" }}>No pending items</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
