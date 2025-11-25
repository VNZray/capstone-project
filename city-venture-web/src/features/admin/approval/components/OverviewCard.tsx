import React from "react";
import { Chip, Divider } from "@mui/joy";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { colors } from "@/src/utils/Colors";
import "@/src/features/admin/approval/styles/OverviewCard.css";

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
  onView?: (item: {
    id: string;
    name: string;
    action_type: "new" | "edit";
  }) => void;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  count,
  icon,
  items,
  onApprove,
  onView,
}) => {
  void onApprove;

  return (
    <Container
      padding="1.5rem"
      radius="12px"
      background={colors.background}
      gap="1rem"
      elevation={2}
      hover
    >
      {/* Header */}
      <Container
        direction="row"
        justify="space-between"
        align="center"
        padding="0"
        gap="0.75rem"
      >
        <Container direction="row" padding="0" gap="0.5rem" align="center">
          <span className="overview-icon" aria-hidden>
            {icon}
          </span>
          <Typography.CardTitle size="sm">{title}</Typography.CardTitle>
        </Container>
        <Chip variant="solid" color="primary" size="sm">
          {count}
        </Chip>
      </Container>

      <Divider />

      {/* Items List */}
      {count > 0 ? (
        <Container padding="0" gap="1rem">
          {items.slice(0, 3).map((item) => (
            <Container
              key={item.id}
              direction="row"
              justify="space-between"
              align="center"
              padding="0"
              gap="0.75rem"
            >
              <Container
                direction="row"
                padding="0"
                gap="0.5rem"
                align="center"
                flex={1}
              >
                <Chip
                  size="sm"
                  variant="soft"
                  color={item.action_type === "new" ? "success" : "primary"}
                >
                  {item.action_type === "new" ? "New" : "Edit"}
                </Chip>
                <Typography.Body size="sm">{item.name}</Typography.Body>
              </Container>
              {onView && (
                <Button
                  size="sm"
                  variant="soft"
                  colorScheme="primary"
                  onClick={() => onView(item)}
                >
                  View
                </Button>
              )}
            </Container>
          ))}
          {count > 3 && (
            <Typography.Body size="xs" color="default">
              +{count - 3} more items
            </Typography.Body>
          )}
        </Container>
      ) : (
        <Typography.Body size="sm" color="default">
          No pending items
        </Typography.Body>
      )}
    </Container>
  );
};

export default OverviewCard;
