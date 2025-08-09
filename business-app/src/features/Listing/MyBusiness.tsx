import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../global.css";
import "../../styles/BusinessList.css"; // new CSS file

const MyBusiness = () => {
  const navigate = useNavigate();

  const businesses = [
    { id: 1, name: "Hotel Naga", description: "Luxury hotel in Naga City" },
    { id: 2, name: "Naga Café", description: "Cozy café for coffee lovers" },
    { id: 3, name: "Naga Spa", description: "Relaxation and wellness center" },
    { id: 4, name: "Naga Rentals", description: "Car and bike rental service" },
  ];

  const navigateToBusiness = (id: number) => {
    navigate(`/business/${id}`);
  };

  return (
    <div className="manage-business">
      <h1 className="text">My Business Listings</h1>
      <a className="business-list-link" href="/dashboard">
        <div className="business-list">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="business-card"
              onClick={() => navigateToBusiness(business.id)}
            >
              <h2 className="business-name">{business.name}</h2>
              <p className="business-desc">{business.description}</p>
            </div>
          ))}
        </div>
      </a>
    </div>
  );
};

export default MyBusiness;
