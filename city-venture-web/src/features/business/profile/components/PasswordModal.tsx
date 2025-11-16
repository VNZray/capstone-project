import {
  Modal,
  Sheet,
  Input,
  FormControl,
  FormLabel,
  Stack,
  Divider,
  IconButton,
} from "@mui/joy";
import { Eye, EyeOff } from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Container from "@/src/components/Container";

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  showPasswords: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  onPasswordChange: (field: string, value: string) => void;
  onTogglePassword: (field: "current" | "new" | "confirm") => void;
  onSubmit: () => void;
}

const PasswordModal = ({
  open,
  onClose,
  passwordData,
  showPasswords,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: PasswordModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Container
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 8,
        }}
        width="clamp(10rem, 90vw, 25rem)"
      >
        <Typography.CardTitle size="sm">Change Password</Typography.CardTitle>
        <Divider />

        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Current Password</FormLabel>
            <Input
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                onPasswordChange("currentPassword", e.target.value)
              }
              placeholder="Enter current password"
              endDecorator={
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => onTogglePassword("current")}
                >
                  {showPasswords.current ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </IconButton>
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>New Password</FormLabel>
            <Input
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => onPasswordChange("newPassword", e.target.value)}
              placeholder="Enter new password"
              endDecorator={
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => onTogglePassword("new")}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                onPasswordChange("confirmPassword", e.target.value)
              }
              placeholder="Confirm new password"
              endDecorator={
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => onTogglePassword("confirm")}
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </IconButton>
              }
            />
          </FormControl>

          <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
            <Button variant="solid" colorScheme="primary" onClick={onSubmit}>
              Change Password
            </Button>
            <Button
              variant="outlined"
              colorScheme="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Modal>
  );
};

export default PasswordModal;
