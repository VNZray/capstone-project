import { Box, Divider, Stack, Chip } from "@mui/joy";
import { Shield, Mail, Lock } from "lucide-react";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import { colors } from "@/src/utils/Colors";

interface AccountSecurityProps {
  email: string;
  onPasswordChange: () => void;
}

const AccountSecurity = ({
  email,
  onPasswordChange,
}: AccountSecurityProps) => {
  return (
    <Container hover elevation={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography.CardTitle size="sm">Account Security</Typography.CardTitle>
        <Shield size={20} color={colors.primary} />
      </Box>
      <Divider />

      <Stack spacing={2}>
        <Box>
          <Typography.Label startDecorator={<Mail />} size="sm">
            Email
          </Typography.Label>
          <Typography.Body size="sm" color="default">
            {email}
          </Typography.Body>
          <Chip size="sm" color="success" variant="soft" sx={{ mt: 0.5 }}>
            Verified
          </Chip>
        </Box>

        <Box>
          <Typography.Label startDecorator={<Lock />} size="sm">
            Password
          </Typography.Label>
          <Typography.Body size="sm" color="default">
            ••••••••••••
          </Typography.Body>
          <Button
            size="sm"
            variant="soft"
            colorScheme="primary"
            startDecorator={<Lock size={16} />}
            onClick={onPasswordChange}
            sx={{ mt: 0.5 }}
          >
            Change Password
          </Button>
        </Box>

        <Box>
          <Typography.Label size="sm">
            Two-Factor Authentication
          </Typography.Label>
          <Typography.Body size="sm" color="default">
            Not enabled
          </Typography.Body>
          <Button
            size="sm"
            variant="soft"
            colorScheme="warning"
            sx={{ mt: 0.5 }}
          >
            Enable 2FA
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default AccountSecurity;