import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "@/src/components/Loading";
import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import { useAuth } from "@/src/context/AuthContext";
import { useBusiness } from "@/src/context/BusinessContext";
import Card from "./components/Card";
import placeholderImage from "@/src/assets/images/uma-hotel-residences.jpg";
import type { Business } from "@/src/types/Business";
import { fetchBusinessesByOwner } from "@/src/services/BusinessService";

const MyBusiness = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBusinessId } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    if (!user?.owner_id) return;

    const loadBusinesses = async () => {
      try {
        const data = await fetchBusinessesByOwner(user.owner_id!);
        setBusinesses(data);
        console.log("Fetched businesses:", data);
      } catch (err) {
        console.error("Error fetching businesses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [user?.owner_id]);

  if (loading) return <Loading />;

  return (
    <PageContainer>
      <Text variant="title">My Business</Text>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {businesses.map((business) => (
          <div
            key={business.id} // ✅ use business.id instead of owner_id
            style={{ cursor: "pointer" }}
            onClick={() => {
              setBusinessId(business.id);
              navigate(`/dashboard`);
            }}
          >
            <Card
              elevation={1}
              image={business.business_image || placeholderImage}
              title={business.business_name}
              subtitle={business.description}
            >
              <Text variant="card-sub-title">{business.email}</Text>
            </Card>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

export default MyBusiness;
