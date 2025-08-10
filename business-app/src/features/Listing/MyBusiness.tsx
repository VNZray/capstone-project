import React from "react";
import { useNavigate } from "react-router-dom";
import "@/global.css";
import "./styles/BusinessList.css"; // new CSS file
import Text from "../../components/Text";
import { supabase } from "@/src/utils/supabase";
const MyBusiness = () => {
  const navigate = useNavigate();

  const businesses = [
    { id: 1, name: "Hotel Naga", description: "Luxury hotel in Naga City" },
    { id: 2, name: "Naga Café", description: "Cozy café for coffee lovers" },
  ];

  const navigateToBusiness = (id: number) => {
    navigate(`/business/${id}`);
  };

  return (
    <div className="container">
      <Text variant="title">My Business Listings</Text>
      <div className="business-list">
        {businesses.map((business) => (
          <a className="business-list-link" href="/dashboard">
            <div
              key={business.id}
              className="business-card"
              onClick={() => navigateToBusiness(business.id)}
            >
              <h2 className="business-name">{business.name}</h2>
              <p className="business-desc">{business.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MyBusiness;
