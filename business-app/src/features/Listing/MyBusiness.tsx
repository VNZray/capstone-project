import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/global.css";
import "./styles/BusinessList.css";
import Text from "../../components/Text";
import Loading from "../../components/Loading"; // import the loading component
import { supabase } from "@/src/utils/supabase";
import Card from "./components/Card";
import image from "@/src/assets/images/uma-hotel-residences.jpg";
import PageContainer from "@/src/components/PageContainer";
const MyBusiness = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<
    { id: number; name: string; description: string }[]
  >([]);

  useEffect(() => {
    // Simulate data fetching (replace this with actual Supabase call)
    const fetchBusinesses = async () => {
      try {
        // Example: fetching from Supabase
        /*
        const { data, error } = await supabase.from("businesses").select("*");
        if (error) throw error;
        setBusinesses(data);
        */
        // Temporary static data:
        setTimeout(() => {
          setBusinesses([
            {
              id: 1,
              name: "Hotel Naga",
              description: "Luxury hotel in Naga City",
            },
            {
              id: 2,
              name: "Naga Café",
              description: "Cozy café for coffee lovers",
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error loading businesses:", err);
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const navigateToBusiness = () => {
    navigate(`/dashboard`);
  };

  if (loading) return <Loading />; // ✅ show loading while fetching

  return (
    <PageContainer>
      <Text variant="title">My Business</Text>
      <div style={{ display: "flex", gap: "1rem" }}>
        {businesses.map((business) => (
          <Link to={"/dashboard"}>
            <Card
              elevation={1}
              image={image}
              title={business.name}
              subtitle={business.description}
            />
          </Link>
        ))}
      </div>
    </PageContainer>
  );
};

export default MyBusiness;
