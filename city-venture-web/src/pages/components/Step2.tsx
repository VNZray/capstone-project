import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import type { Owner } from "@/src/types/Owner";
import type { User } from "@/src/types/User";
import { FormControl, Input, FormLabel, Card } from "@mui/joy";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  UserCircle,
} from "lucide-react";

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
      {/* Header Section */}
      <Card
        variant="soft"
        sx={{
          background: "linear-gradient(135deg, #0A1B47 0%, #0077B6 100%)",
          color: "white",
          border: "none",
          p: 3,
          mb: 3,
        }}
      >
        <Typography.CardTitle sx={{ color: "white", mb: 1 }}>
          Owner Information
        </Typography.CardTitle>
        <Typography.CardSubTitle sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
          Tell us about the business owner
        </Typography.CardSubTitle>
      </Card>

      <Container>
        {/* Personal Information Section */}
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: "12px" }}>
          <Typography.Label
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
            }}
          >
            <UserCircle size={20} />
            Personal Details
          </Typography.Label>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <FormControl required>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <UserIcon size={18} />
                First Name
              </FormLabel>
              <Input
                placeholder="Enter your first name"
                value={ownerData.first_name}
                onChange={(e) =>
                  setOwnerData({ ...ownerData, first_name: e.target.value })
                }
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                  fontSize: "0.9375rem",
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Middle Name (Optional)
              </FormLabel>
              <Input
                placeholder="Enter your middle name"
                value={ownerData.middle_name}
                onChange={(e) =>
                  setOwnerData({ ...ownerData, middle_name: e.target.value })
                }
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                  fontSize: "0.9375rem",
                }}
              />
            </FormControl>

            <FormControl required>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Last Name
              </FormLabel>
              <Input
                placeholder="Enter your last name"
                value={ownerData.last_name}
                onChange={(e) =>
                  setOwnerData({ ...ownerData, last_name: e.target.value })
                }
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                  fontSize: "0.9375rem",
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Calendar size={18} />
                Birthdate (Optional)
              </FormLabel>
              <Input
                type="date"
                value={ownerData.birthdate}
                onChange={(e) =>
                  setOwnerData({ ...ownerData, birthdate: e.target.value })
                }
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                  fontSize: "0.9375rem",
                }}
              />
            </FormControl>
          </div>
        </Card>

        {/* Contact Information Section */}
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: "12px" }}>
          <Typography.Label
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
            }}
          >
            <Mail size={20} />
            Contact Information
          </Typography.Label>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <FormControl required>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Mail size={18} />
                Email Address
              </FormLabel>
              <Input
                type="email"
                placeholder="owner@example.com"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                  fontSize: "0.9375rem",
                }}
              />
            </FormControl>

            <FormControl required>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Phone size={18} />
                Phone Number
              </FormLabel>
              <Input
                placeholder="+63 XXX XXX XXXX"
                value={userData.phone_number}
                onChange={(e) =>
                  setUserData({ ...userData, phone_number: e.target.value })
                }
                sx={{
                  borderRadius: "8px",
                  minHeight: "44px",
                  fontSize: "0.9375rem",
                }}
              />
            </FormControl>
          </div>
        </Card>
      </Container>
    </PageContainer>
  );
};

export default Step2;
