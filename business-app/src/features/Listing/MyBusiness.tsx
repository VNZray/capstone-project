import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "@/src/components/Loading";
import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import { useAuth } from "@/src/context/AuthContext";
import { useBusiness } from "@/src/context/BusinessContext";
import Card from "./components/Card";
import placeholderImage from "@/src/assets/images/uma-hotel-residences.jpg"; // replace with real image if available
import type { Business } from "@/src/types/Business";

const MyBusiness = () => {
  const navigate = useNavigate();
  const { user, API_URL } = useAuth();
  const { setBusinessId } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    if (!user?.owner_id) return;

    const fetchBusinesses = async () => {
      try {
        const res = await fetch(`${API_URL}/business/owner/${user.owner_id}`);
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : [data]);
        console.error("Fetched businesses:", data);

      } catch (err) {
        console.error("Error fetching businesses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [user?.owner_id, API_URL]);

  if (loading) return <Loading />;

  return (
    <PageContainer>
      <Text variant="title">My Business</Text>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {businesses.map((business) => (
          <div
            key={business.owner_id}
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
