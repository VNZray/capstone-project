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
import type { Business } from "@/src/types/Business";
import axios from "axios";
import type { Permit } from "@/src/types/Permit";
import { insertData } from "@/src/api_function";

// steps definition
const steps = [
  "Basic",
  "Contact",
  "Location",
  "Social Media",
  "Pricing",
  "Permits",
  "Review & Submit",
];

// ✅ Moved outside BusinessRegistration so it doesn’t get recreated on every render
const StepContent: React.FC<{ step: number; commonProps: any }> = ({
  step,
  commonProps,
}) => {
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

const BusinessRegistration: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [externalBookings, setExternalBookings] = useState<
    { name: string; link: string }[]
  >([]);

  const [formData, setFormData] = useState<Business>({
    id: "",
    business_image: "",
    business_name: "Kim Angela Homestay",
    phone_number: "09380417373",
    email: "kim@gmail.com",
    barangay_id: 0,
    municipality_id: 0,
    province_id: 0,
    description: "This place is great",
    instagram_url: "kim.com",
    x_url: "kim.com",
    address: "123 Street, City",
    website_url: "kim.com",
    facebook_url: "kim.com",
    longitude: "",
    latitude: "",
    min_price: "1000",
    max_price: "5000",
    owner_id: "",
    status: "Pending",
    business_category_id: 0,
    business_type_id: 0,
    hasBooking: false,
  });

  const [permitData, setPermitData] = useState<Permit[]>([]);

  useEffect(() => {
    const fetchOwnerId = async () => {
      if (!user) {
        alert("Error User not authenticated.");
        return;
      }

      const ownerData = await fetchOwnerDetails(user.owner_id!);
      setOwnerId(ownerData.id);

      setFormData((prev) => ({
        ...prev,
        owner_id: ownerData.id,
      }));

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
    permitData,
    setPermitData,
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

  const handleSubmit = async () => {
    try {
      // 1️⃣ Insert Business
      const res = await axios.post(`${api}/business`, formData);
      const businessId = res.data.id;
      console.log(businessId);

      // 2️⃣ Insert External Bookings (if any)
      if (externalBookings.length > 0) {
        await Promise.all(
          externalBookings.map((site) => {
            if (!site.name || !site.link) return null; // skip empty

            return axios.post(`${api}/external-booking`, {
              business_id: businessId,
              name: site.name,
              link: site.link,
            });
          })
        );
      }

      if (permitData.length > 0) {
        await Promise.all(
          permitData.map((permit) =>
            axios.post(`${api}/permit`, {
              business_id: businessId,
              permit_type: permit.permit_type,
              file_url: permit.file_url,
              file_format: permit.file_format,
              file_size: permit.file_size,
              status: permit.status || "Pending",
            })
          )
        );
      }

      console.log("✅ Business registration submitted successfully");
      navigate("/business");
    } catch (error) {
      console.error("❌ Failed to submit registration:", error);
      alert("Something went wrong. Please try again.");
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
        <StepContent step={activeStep} commonProps={commonProps} />

        {/* Buttons */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 20px",
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
