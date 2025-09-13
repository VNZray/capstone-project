import Text from "@/src/components/Text";
import { useAuth } from "@/src/context/AuthContext"
const Profile = () => {
  const { user } = useAuth();
  return (
    <>
      <Text variant="title">Welcome {user?.first_name} {user?.last_name}</Text>
    </>
  );
};

export default Profile;
