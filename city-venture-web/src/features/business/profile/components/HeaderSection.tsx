import { Box, Avatar, Stack, Chip, IconButton, Tooltip } from "@mui/joy";
import {
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Lock,
  Camera,
} from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Container from "@/src/components/Container";
import ImageUpload from "@/src/components/ImageUpload";
import { colors } from "@/src/utils/Colors";
import type { UserDetails } from "@/src/types/User";

interface HeaderSectionProps {
  profileData: {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_profile: string;
  };
  user: UserDetails | null;
  editMode: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPasswordChange: () => void;
  onProfileImageUpload: (url: string) => void;
}

const HeaderSection = ({
  profileData,
  user,
  editMode,
  onEditToggle,
  onSave,
  onCancel,
  onPasswordChange,
  onProfileImageUpload,
}: HeaderSectionProps) => {
  return (
    <Container hover elevation={2} style={{ marginBottom: 24 }}>
      <Box sx={{ position: "relative" }}>
        {/* Cover Banner */}
        <Box
          sx={{
            height: { xs: 120, sm: 160, md: 200 },
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            borderRadius: "12px 12px 0 0",
            position: "relative",
          }}
        />

        {/* Profile Info */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            pb: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "flex-start" },
            gap: 3,
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              position: "relative",
              mt: { xs: -6, md: -8 },
            }}
          >
            <Avatar
              src={profileData.user_profile}
              alt={`${profileData.first_name} ${profileData.last_name}`}
              sx={{
                width: { xs: 120, md: 160 },
                height: { xs: 120, md: 160 },
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {profileData.first_name?.[0]}
              {profileData.last_name?.[0]}
            </Avatar>
            <Tooltip title="Change profile picture">
              <IconButton
                size="sm"
                color="primary"
                variant="solid"
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  borderRadius: "50%",
                }}
                onClick={() =>
                  document.getElementById("profile-image-upload")?.click()
                }
              >
                <Camera size={18} />
              </IconButton>
            </Tooltip>
            <div style={{ display: "none" }}>
              <ImageUpload
                folderName="profiles"
                uploadTo="user-profiles"
                onUploadComplete={onProfileImageUpload}
                maxSizeMB={5}
              />
            </div>
          </Box>

          {/* User Info */}
          <Box
            sx={{
              flex: 1,
              mt: { xs: 2, md: 2 },
            }}
          >
            <Typography.Header
              size="xs"
              sx={{
                textAlign: {
                  xs: "center",
                  sm: "center",
                  md: "left",
                  lg: "left",
                },
              }}
            >
              {user?.first_name} {profileData.middle_name}{" "}
              {profileData?.last_name}
            </Typography.Header>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 1,
                justifyContent: { xs: "center", md: "flex-start" },
                flexWrap: "wrap",
              }}
            >
              <Chip
                size="sm"
                color={user?.is_verified ? "success" : "warning"}
                startDecorator={
                  user?.is_verified ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )
                }
              >
                {user?.is_verified ? "Verified" : "Pending Verification"}
              </Chip>
              <Chip size="sm" variant="soft" color="primary">
                {user?.role_name || "Owner"}
              </Chip>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 2, flexWrap: "wrap", gap: 0 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography.Body
                  startDecorator={<Mail size={16} />}
                  size="sm"
                  color="default"
                >
                  {profileData.email}
                </Typography.Body>
              </Box>
              {profileData.phone_number && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography.Body
                    startDecorator={<Phone size={16} />}
                    size="sm"
                    color="default"
                  >
                    {profileData.phone_number}
                  </Typography.Body>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, md: 2 } }}>
            {!editMode ? (
              <>
                <Button
                  variant="solid"
                  colorScheme="primary"
                  startDecorator={<Edit2 size={18} />}
                  onClick={onEditToggle}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  colorScheme="secondary"
                  startDecorator={<Lock size={18} />}
                  onClick={onPasswordChange}
                >
                  Change Password
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="solid"
                  colorScheme="success"
                  startDecorator={<Save size={18} />}
                  onClick={onSave}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  colorScheme="secondary"
                  startDecorator={<X size={18} />}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default HeaderSection;
