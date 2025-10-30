import ResponsiveText from "@/src/components/ResponsiveText";
import { useBusiness } from "@/src/context/BusinessContext";

const Dashboard = () => {
  const { businessDetails, loading } = useBusiness();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <ResponsiveText type="title-small" weight="bold">{businessDetails?.business_name}</ResponsiveText>
    </>
  );
};

export default Dashboard;
