import React, { useEffect, useState } from "react";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import { Stepper, Step, StepIndicator, Button } from "@mui/joy";
import { Check } from "@mui/icons-material";
import Text from "@/src/components/Text";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { fetchOwnerDetails } from "@/src/services/OwnerService";
import { colors } from "@/src/utils/Colors";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import Step6 from "./steps/Step6";
import Step7 from "./steps/Step7";

const steps = [
  "Basic",
  "Contact",
  "Location",
  "Links & Booking",
  "Pricing",
  "Permits",
  "Review & Submit",
];

const BusinessRegistration: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user, api } = useAuth();
  const navigate = useNavigate();
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
  };
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      navigate("/business"); // Go back to business list if on first step
    }
  };

  // Submit function for final step
  const handleSubmit = async () => {
    try {
      // Collect form data from all steps here (example)
      const formData = {
        /* basicInfo, contactInfo, location, links, pricing, permits */
      };

      // Send data to backend API (example)
      // await api.post("/business-registration", formData);

      console.log("Business registration submitted:", formData);

      // Navigate to a success/confirmation page
      navigate("/business/success");
    } catch (error) {
      console.error("Failed to submit registration:", error);
    }
  };

  const StepContent: React.FC<{ step: number }> = ({ step }) => {
    switch (step) {
      case 0:
        return <Step1 {...commonProps} />;
      case 1:
        return <Step2 {...commonProps} />;
      case 2:
        return <Step3 {...commonProps} />;
      case 3:
        return <Step4 {...commonProps} />;
      case 4:
        return <Step5 {...commonProps} />;
      case 5:
        return <Step6 {...commonProps} />;
      case 6:
        return <Step7 {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <PageContainer style={{ padding: "20px 340px" }}>
      <Container elevation={2} style={{ padding: 20 }}>
        <Stepper size="lg" orientation="horizontal">
          {steps.map((label, index) => (
            <Step key={label} orientation="vertical">
              <StepIndicator
                variant={activeStep >= index ? "solid" : "soft"}
                color={activeStep >= index ? "primary" : "neutral"}
              >
                {activeStep > index ? <Check /> : index + 1}
              </StepIndicator>
              <Text
                color={activeStep >= index ? colors.secondary : colors.black}
                variant="label"
                style={{ marginTop: 8 }}
              >
                {label}
              </Text>
            </Step>
          ))}
        </Stepper>
      </Container>

      <Container elevation={2} style={{ padding: 20 }}>
        {/* Render the page/content for the active step */}
        <div>
          <StepContent step={activeStep} />
        </div>

        {/* Buttons */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 20px"
          }}
        >
          <Button
            size="lg"
            variant="outlined"
            color="neutral"
            onClick={handleBack}
            style={{ width: 200 }}
          >
            Back
          </Button>
          <Button
            size="lg"
            variant="solid"
            color="primary"
            onClick={handleNext}
            style={{ width: 200 }}
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </div>
      </Container>
    </PageContainer>
  );
};

export default BusinessRegistration;
