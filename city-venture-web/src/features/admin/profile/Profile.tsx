import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import { useAuth } from "@/src/context/AuthContext";

const TourismProfile = () => {
  const { user } = useAuth();
  return (
    <PageContainer>
      <Typography.Header>
        {user?.first_name} {user?.last_name}
      </Typography.Header>
    </PageContainer>
  );
};

export default TourismProfile;
