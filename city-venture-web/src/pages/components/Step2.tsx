import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import type { Owner } from "@/src/types/Owner";
import type { User } from "@/src/types/User";
import { Email } from "@mui/icons-material";
import { FormControl, Input, FormLabel } from "@mui/joy";
import { Phone } from "lucide-react";

type Props = {
  userData: User;
  setUserData: React.Dispatch<React.SetStateAction<User>>;
  ownerData: Owner;
  setOwnerData: React.Dispatch<React.SetStateAction<Owner>>;
};

const Step2: React.FC<Props> = ({
  userData,
  setUserData,
  ownerData,
  setOwnerData,
}) => {
  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0">
        <Typography.CardTitle>
          Owner Information
        </Typography.CardTitle>
        <Typography.CardSubTitle>
          Please provide your business information.
        </Typography.CardSubTitle>
      </Container>

      <Container>
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Input
            placeholder="Enter your first name"
            fullWidth
            value={ownerData.first_name}
            onChange={(e) =>
              setOwnerData({ ...ownerData, first_name: e.target.value })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Middle Name</FormLabel>
          <Input
            placeholder="Enter your middle name"
            fullWidth
            value={ownerData.middle_name}
            onChange={(e) =>
              setOwnerData({ ...ownerData, middle_name: e.target.value })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Last Name</FormLabel>
          <Input
            placeholder="Enter your last name"
            fullWidth
            value={ownerData.last_name}
            onChange={(e) =>
              setOwnerData({ ...ownerData, last_name: e.target.value })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            startDecorator={<Email />}
            placeholder="Enter your email"
            fullWidth
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Phone Number</FormLabel>
          <Input
            startDecorator={<Phone />}
            placeholder="Enter your phone number"
            fullWidth
            value={userData.phone_number}
            onChange={(e) =>
              setUserData({ ...userData, phone_number: e.target.value })
            }
          />
        </FormControl>
      </Container>
    </PageContainer>
  );
};

export default Step2;
