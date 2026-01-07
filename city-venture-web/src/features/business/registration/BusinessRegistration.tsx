import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Sheet,
  Stepper,
  Step,
  StepIndicator,
  Typography as JoyTypography,
} from "@mui/joy";
import { Check } from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Alert from "@/src/components/Alert";
import { colors } from "@/src/utils/Colors";
import type { Business } from "@/src/types/Business";
import type { Address } from "@/src/types/Address";
import type { Permit } from "@/src/types/Permit";
import type { BusinessHours } from "@/src/types/Business";
import type { BusinessAmenity } from "@/src/types/Amenity";
import { useAuth } from "@/src/context/AuthContext";

// Import step components
import Step1Basic from "./steps/Step1Basic";
import Step2Contact from "./steps/Step2Contact";
import Step3Location from "./steps/Step3Location";
import Step4Hours from "./steps/Step4Hours";
import Step5Photos from "./steps/Step5Photos";
import Step6Permits from "./steps/Step6Permits";
import Step7Review from "./steps/Step7Review";

const steps = [
  "Basic",
  "Contact",
  "Location",
  "Business Hours",
  "Photos",
  "Permits",
  "Review & Submit",
];

interface CommonProps {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
  bookingSites: { name: string; link: string }[];
  setBookingSites: React.Dispatch<
    React.SetStateAction<{ name: string; link: string }[]>
  >;
  permitData: Permit[];
  setPermitData: React.Dispatch<React.SetStateAction<Permit[]>>;
  businessHours: BusinessHours[];
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
}

const StepContent: React.FC<{ step: number; commonProps: CommonProps }> = ({
  step,
  commonProps,
}) => {
  switch (step) {
    case 0:
      return (
        <Step1Basic
          data={commonProps.data}
          setData={commonProps.setData}
          businessAmenities={commonProps.businessAmenities}
          setBusinessAmenities={commonProps.setBusinessAmenities}
        />
      );
    case 1:
      return (
        <Step2Contact data={commonProps.data} setData={commonProps.setData} />
      );
    case 2:
      return (
        <Step3Location
          data={commonProps.data}
          setData={commonProps.setData}
          addressData={commonProps.addressData}
          setAddressData={commonProps.setAddressData}
        />
      );
    case 3:
      return (
        <Step4Hours
          businessHours={commonProps.businessHours}
          setBusinessHours={commonProps.setBusinessHours}
          bookingSites={commonProps.bookingSites}
          setBookingSites={commonProps.setBookingSites}
        />
      );
    case 4:
      return (
        <Step5Photos data={commonProps.data} setData={commonProps.setData} />
      );
    case 5:
      return (
        <Step6Permits
          permitData={commonProps.permitData}
          setPermitData={commonProps.setPermitData}
        />
      );
    case 6:
      return (
        <Step7Review
          data={commonProps.data}
          permitData={commonProps.permitData}
          businessHours={commonProps.businessHours}
          businessAmenities={commonProps.businessAmenities}
        />
      );
    default:
      return null;
  }
};

const BusinessRegistration: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    type: "info",
    title: "",
    message: "",
  });

  const [externalBookings, setExternalBookings] = useState<
    { name: string; link: string }[]
  >([]);

  const [formData, setFormData] = useState<Business>({
    id: "",
    business_image: "",
    business_name: "",
    phone_number: "",
    email: "",
    description: "",
    address: "",
    longitude: "",
    latitude: "",
    owner_id: user?.id ?? "",
    barangay_id: 0,
    status: "Pending",
    hasBooking: false,
    category_ids: [],
    primary_category_id: undefined,
  });

  const [addressData, setAddressData] = useState<Address>({
    barangay_id: 0,
    municipality_id: 0,
    province_id: 0,
  });

  const [permitData, setPermitData] = useState<Permit[]>([]);
  const [businessAmenities, setBusinessAmenities] = useState<BusinessAmenity[]>(
    []
  );

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([
    {
      day_of_week: "Monday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Tuesday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Wednesday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Thursday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Friday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Saturday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Sunday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
  ]);

  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({ ...prev, owner_id: user.id }));
    }
  }, [user]);

  const commonProps: CommonProps = {
    data: formData,
    setData: setFormData,
    addressData,
    setAddressData,
    bookingSites: externalBookings,
    setBookingSites: setExternalBookings,
    permitData,
    setPermitData,
    businessHours,
    setBusinessHours,
    businessAmenities,
    setBusinessAmenities,
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: Implement submission logic
      console.log("Submitting business registration:", {
        formData,
        addressData,
        permitData,
        businessHours,
        businessAmenities,
      });

      setAlertConfig({
        type: "success",
        title: "Registration Submitted!",
        message: "Your business registration has been submitted successfully.",
      });
      setShowAlert(true);

      setTimeout(() => {
        navigate("/my-business");
      }, 2000);
    } catch (error) {
      console.error("Error submitting:", error);
      setAlertConfig({
        type: "error",
        title: "Submission Failed",
        message:
          "There was an error submitting your registration. Please try again.",
      });
      setShowAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.lightBackground,
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography.Header size="lg" color="primary" sx={{ mb: 1 }}>
            Business Registration
          </Typography.Header>
          <Typography.Body size="sm" color="secondary">
            Complete all steps to register your business
          </Typography.Body>
        </Box>

        {/* Main Card */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: colors.white,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Stepper */}
          <Box
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              backgroundColor: colors.offWhite,
            }}
          >
            <Stepper
              sx={{
                width: "100%",
                "--Stepper-verticalGap": "2rem",
                "--Step-connectorInset": "0.5rem",
              }}
            >
              {steps.map((step, index) => (
                <Step
                  key={step}
                  completed={activeStep > index}
                  active={activeStep === index}
                  indicator={
                    <StepIndicator
                      variant={
                        activeStep > index
                          ? "solid"
                          : activeStep === index
                          ? "solid"
                          : "outlined"
                      }
                      color={activeStep >= index ? "primary" : "neutral"}
                    >
                      {activeStep > index ? <Check size={18} /> : index + 1}
                    </StepIndicator>
                  }
                  sx={{
                    "&::after": {
                      bgcolor:
                        activeStep > index ? colors.primary : colors.gray,
                    },
                  }}
                >
                  <JoyTypography
                    level="body-sm"
                    sx={{
                      fontWeight: activeStep === index ? 600 : 400,
                      color: activeStep >= index ? colors.primary : colors.gray,
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {step}
                  </JoyTypography>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Content Area */}
          <Box
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              minHeight: "400px",
            }}
          >
            <StepContent step={activeStep} commonProps={commonProps} />
          </Box>

          {/* Actions */}
          <Box
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderTop: `1px solid ${colors.offWhite}`,
              backgroundColor: colors.lightBackground,
            }}
          >
            <Grid container spacing={2} justifyContent="space-between">
              <Grid xs={12} sm={6} md={4}>
                <Button
                  variant="outlined"
                  colorScheme="secondary"
                  fullWidth
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{ height: "44px" }}
                >
                  Back
                </Button>
              </Grid>
              <Grid xs={12} sm={6} md={4}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={{ height: "44px" }}
                  >
                    {submitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                ) : (
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    fullWidth
                    onClick={handleNext}
                    sx={{ height: "44px" }}
                  >
                    Next
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Sheet>
      </Box>

      {/* Alert */}
      <Alert
        open={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={false}
      />
    </Box>
  );
};

export default BusinessRegistration;
