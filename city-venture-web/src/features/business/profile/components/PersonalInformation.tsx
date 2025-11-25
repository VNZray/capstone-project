import {
  Box,
  Grid,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
  Divider,
  Textarea,
} from "@mui/joy";
import { User, Globe, Phone, MapPin } from "lucide-react";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";

interface PersonalInformationProps {
  profileData: {
    first_name: string;
    middle_name: string;
    last_name: string;
    gender: string;
    birthdate: string;
    nationality: string;
    ethnicity: string;
    phone_number: string;
    address: string;
  };
  editMode: boolean;
  onChange: (field: string, value: string) => void;
}

const PersonalInformation = ({
  profileData,
  editMode,
  onChange,
}: PersonalInformationProps) => {
  return (
    <Container hover elevation={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography.CardTitle size="sm">
          Personal Information
        </Typography.CardTitle>
        <User size={20} color={colors.primary} />
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {/* First Name */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>First Name</FormLabel>
            <Input
              value={profileData.first_name}
              onChange={(e) => onChange("first_name", e.target.value)}
              disabled={!editMode}
              placeholder="Enter first name"
            />
          </FormControl>
        </Grid>

        {/* Middle Name */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Middle Name</FormLabel>
            <Input
              value={profileData.middle_name}
              onChange={(e) => onChange("middle_name", e.target.value)}
              disabled={!editMode}
              placeholder="Enter middle name (optional)"
            />
          </FormControl>
        </Grid>

        {/* Last Name */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <Input
              value={profileData.last_name}
              onChange={(e) => onChange("last_name", e.target.value)}
              disabled={!editMode}
              placeholder="Enter last name"
            />
          </FormControl>
        </Grid>

        {/* Gender */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Gender</FormLabel>
            <Select
              value={profileData.gender}
              onChange={(_, value) => onChange("gender", value || "")}
              disabled={!editMode}
              placeholder="Select gender"
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
              <Option value="Prefer not to say">Prefer not to say</Option>
            </Select>
          </FormControl>
        </Grid>

        {/* Birthdate */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Birthdate</FormLabel>
            <Input
              type="date"
              value={profileData.birthdate}
              onChange={(e) => onChange("birthdate", e.target.value)}
              disabled={!editMode}
            />
          </FormControl>
        </Grid>

        {/* Nationality */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Nationality</FormLabel>
            <Input
              value={profileData.nationality}
              onChange={(e) => onChange("nationality", e.target.value)}
              disabled={!editMode}
              placeholder="Enter nationality"
              startDecorator={<Globe size={18} />}
            />
          </FormControl>
        </Grid>

        {/* Ethnicity */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Ethnicity</FormLabel>
            <Input
              value={profileData.ethnicity}
              onChange={(e) => onChange("ethnicity", e.target.value)}
              disabled={!editMode}
              placeholder="Enter ethnicity"
            />
          </FormControl>
        </Grid>

        {/* Phone Number */}
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Phone Number</FormLabel>
            <Input
              value={profileData.phone_number}
              onChange={(e) => onChange("phone_number", e.target.value)}
              disabled={!editMode}
              placeholder="Enter phone number"
              startDecorator={<Phone size={18} />}
            />
          </FormControl>
        </Grid>

        {/* Address */}
        <Grid xs={12}>
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Textarea
              value={profileData.address}
              onChange={(e) => onChange("address", e.target.value)}
              disabled={!editMode}
              placeholder="Enter complete address"
              minRows={2}
              maxRows={4}
              startDecorator={<MapPin size={18} />}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PersonalInformation;
