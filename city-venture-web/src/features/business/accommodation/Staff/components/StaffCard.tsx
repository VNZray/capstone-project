import Container from "@/src/components/Container";
import { AspectRatio, Divider, IconButton } from "@mui/joy";
import placeholder from "@/src/assets/images/placeholder-image.png";
import ResponsiveText from "@/src/components/ResponsiveText";
import { Email, Lock } from "@mui/icons-material";
import { Edit, Trash2, Ban } from "lucide-react";
import Button from "@/src/components/Button";

interface StaffProps {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  onEdit?: (id: string) => void;
  onToggleActive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const StaffCard: React.FC<StaffProps> = ({
  id,
  first_name = "Ryven",
  last_name = "Clores",
  role = "Staff",
  is_active = true,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  return (
    <Container elevation={2} direction="column" align="center" padding="16px">
      {/* Avatar */}
      <Container padding="0" width="75%">
        <AspectRatio
          sx={{ borderRadius: "50%", overflow: "hidden" }}
          ratio="2/2"
        >
          <img
            src={placeholder}
            alt={`${first_name} ${last_name}`}
            style={{ backgroundSize: "cover" }}
          />
        </AspectRatio>
      </Container>

      {/* Name and Role */}
      <Container gap="0" padding="0" align="center">
        <ResponsiveText type="label-medium" weight="bold">
          {first_name} {last_name}
        </ResponsiveText>
        <ResponsiveText type="label-small" weight="semi-bold">
          {role}
        </ResponsiveText>
      </Container>

      <Divider sx={{ my: 1, width: "100%" }} />
      {/* Actions */}
      <Container width="100%" direction="row" padding="0" gap="8px">
        <Button
          fullWidth
          size="sm"
          onClick={() => onEdit?.(id)}
          startDecorator={<Edit size={16} />}
        >
          Edit
        </Button>
        <IconButton
          variant="soft"
          color="warning"
          size="sm"
          onClick={() => onToggleActive?.(id)}
          title={is_active ? "Deactivate" : "Activate"}
        >
          <Ban size={18} />
        </IconButton>
        <IconButton
          variant="soft"
          color="danger"
          size="sm"
          onClick={() => onDelete?.(id)}
          title="Delete"
        >
          <Trash2 size={18} />
        </IconButton>
      </Container>
    </Container>
  );
};

export default StaffCard;
