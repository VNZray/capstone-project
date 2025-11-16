import { Box, Divider, Stack } from "@mui/joy";
import { Clock } from "lucide-react";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";

interface ActivityProps {
  user: {
    last_login?: string | null | undefined;
    created_at?: string | null | undefined;
    updated_at?: string | null | undefined;
  };
}

const Activity = ({ user }: ActivityProps) => {
  return (
    <Container hover elevation={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography.CardTitle size="sm">Activity</Typography.CardTitle>
        <Clock size={20} color={colors.primary} />
      </Box>
      <Divider />

      <Stack spacing={1.5}>
        <Box>
          <Typography.Label size="sm">Last Login</Typography.Label>
          <Typography.Body size="sm" color="default">
            {user?.last_login
              ? new Date(user.last_login).toLocaleString()
              : "Never logged in"}
          </Typography.Body>
        </Box>

        <Box>
          <Typography.Label size="sm">Account Created</Typography.Label>
          <Typography.Body size="sm" color="default">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "Unknown"}
          </Typography.Body>
        </Box>

        <Box>
          <Typography.Label size="sm">Last Updated</Typography.Label>
          <Typography.Body size="sm" color="default">
            {user?.updated_at
              ? new Date(user.updated_at).toLocaleDateString()
              : "Never updated"}
          </Typography.Body>
        </Box>
      </Stack>
    </Container>
  );
};

export default Activity;