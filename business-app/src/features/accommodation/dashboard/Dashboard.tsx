import Text from "@/src/components/Text";
import { useBusiness } from "@/src/context/BusinessContext";

const Dashboard = () => {
  const { businessDetails, loading } = useBusiness();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Text variant="title">{businessDetails?.business_name}</Text>
    </>
  );
};

export default Dashboard;
