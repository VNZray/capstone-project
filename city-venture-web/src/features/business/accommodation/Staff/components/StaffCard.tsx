import Container from "@/src/components/Container";
import { AspectRatio, Button, Divider, IconButton } from "@mui/joy";
import placeholder from "@/src/assets/images/placeholder-image.png";
import ResponsiveText from "@/src/components/ResponsiveText";
import { Block, Remove } from "@mui/icons-material";
import { Edit, Trash } from "lucide-react";

interface StaffProps {
  email: string;
  password: string;
}

const StaffCard: React.FC<StaffProps> = ({ email, password }) => {
  return (
    <Container elevation={2} direction="column" align="center">
      <Container padding="0" width="70%">
        <AspectRatio
          sx={{ borderRadius: "50%", overflow: "hidden" }}
          ratio="2/2"
        >
          <img
            src={placeholder}
            alt="Staff Member"
            style={{ backgroundSize: "cover" }}
          />
        </AspectRatio>
      </Container>

      <Container gap="0" padding="0" align="center">
        <ResponsiveText type="label-large" weight="bold">
          Rayven Clores
        </ResponsiveText>
        <ResponsiveText type="label-medium" weight="semi-bold">
          Manager
        </ResponsiveText>
      </Container>

      <Container width="100%" align="left" gap="0" padding="0">
        <ResponsiveText type="label-medium" weight="medium">
          Email: {email}
        </ResponsiveText>
        <ResponsiveText type="label-medium" weight="medium">
          Password: {password}
        </ResponsiveText>
      </Container>

      <Divider />
      <Container width="100%" direction="row" padding="0">
        <Button fullWidth>Edit</Button>
        <IconButton variant="soft" color="primary">
          {<Block />}
        </IconButton>
        <IconButton variant="soft" color="danger">
          {<Trash />}
        </IconButton>
      </Container>
    </Container>
  );
};
export default StaffCard;
