import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/utils/supabase";

import Stepper from "@/src/components/Stepper";
import StepBasics from "./components/StepBasics";
import StepContact from "./components/StepContact";
import StepLocation from "./components/StepLocation";
import StepDescription from "./components/StepDescription";
import StepLinks from "./components/StepLinks";
import StepPricing from "./components/StepPricing";
import StepPermits from "./components/StepPermits";
import StepReview from "./components/StepReview";
import StepSubmit from "./components/StepSubmit";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import { fetchOwnerDetails } from "@/src/services/OwnerService";

const BusinessListing: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user, api } = useAuth();
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const [externalBookings, setExternalBookings] = useState<BookingSite[]>([]);
  type BookingSite = {
    name: string;
    link: string;
  };
  useEffect(() => {
    const fetchOwnerId = async () => {
      if (!user) {
        alert("Error User not authenticated.");
        return;
      }

      const ownerData = await fetchOwnerDetails(user.owner_id!);
      setOwnerId(ownerData.id);
      setFormData({
        business_name: "UMA Residences & Hotel",
        phone_number: "095612315534",
        email: "uma@example.com",
        barangay_id: "",
        municipality_id: "",
        province_id: "",
        description: "Business description",
        instagram_url: "https://instagram.com/sampaguita",
        tiktok_url: "https://tiktok.com/sampaguita",
        facebook_url: "https://facebook.com/sampaguita",
        longitude: "123.19816120246286",
        latitude: "13.629396465124925",
        min_price: "1000",
        max_price: "5000",
        owner_id: ownerData.id,
        status: "Pending",
        business_category_id: "",
        bsuiness_type_id: "",
        hansBooking: 1,
      });

      setExternalBookings([{ name: "", link: "" }]);
    };

    fetchOwnerId();
  }, [user]);

  if (!formData) return null;

  const commonProps = {
    api,
    data: formData,
    bookingSite: externalBookings,
    setBookingSites: setExternalBookings,
    setData: setFormData,
    onNext: () => setCurrentStep((prev) => prev + 1),
    onPrev: () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBasics {...commonProps} />;
      case 1:
        return <StepContact {...commonProps} />;
      case 2:
        return <StepLocation {...commonProps} />;
      case 3:
        return <StepDescription {...commonProps} />;
      case 4:
        return <StepLinks {...commonProps} />;
      case 5:
        return <StepPricing {...commonProps} />;
      case 6:
        return <StepPermits {...commonProps} />;
      case 7:
        return <StepReview {...commonProps} />;
      case 8:
        return <StepSubmit {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "20px",
      }}
    >
      <Container height="770px" elevation={3}>
        <Stepper currentStep={currentStep} />
      </Container>
      <Container
        style={{ overflowBlock: "hidden" }}
        height="770px"
        width="650px"
        elevation={3}
      >
        {renderStep()}
      </Container>
    </PageContainer>
  );
};

export default BusinessListing;
