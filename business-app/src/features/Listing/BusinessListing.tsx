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
import Button from "@/src/components/Button";
import Text from "@/src/components/Text";
import PageContainer from "@/src/components/PageContainer";

const BusinessListing: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const [formData, setFormData] = useState<any | null>(null);

  const commonProps = {
    onNext: () => setCurrentStep((prev) => Math.min(prev + 1, 8)),
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
        gap: 24,
        padding: 20,
        alignItems: "flex-start",
      }}
    >
      <Stepper currentStep={currentStep} />
      <div style={{ flexBasis: "40%", minWidth: 300, padding: 20 }}>
        {renderStep()}
      </div>
    </PageContainer>
  );
};

export default BusinessListing;
