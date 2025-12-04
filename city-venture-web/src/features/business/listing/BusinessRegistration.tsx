import React, { useEffect, useState } from "react";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import { Button, LinearProgress, IconButton, Box, Stack } from "@mui/joy";
import { ArrowBackRounded } from "@mui/icons-material";
import Typography from "@/src/components/Typography";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/utils/Colors";
import heroImg from "@/src/assets/gridimages/grid5.jpg";
import { useMediaQuery } from "@mui/material";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step3BusinessHours from "./steps/Step3BusinessHours";
import Step4 from "./steps/Step4";
import Step4ImageUpload from "./steps/Step4ImageUpload";
import Step5 from "./steps/Step5";

import type {
  Business,
  BusinessHours,
  Registration,
} from "@/src/types/Business";
import apiClient from "@/src/services/apiClient";
import type { Permit } from "@/src/types/Permit";
import type { BusinessAmenity } from "@/src/types/Amenity";
import type { Address } from "@/src/types/Address";
// steps definition
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
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
  bookingSite: { name: string; link: string }[];
  setBookingSites: React.Dispatch<
    React.SetStateAction<{ name: string; link: string }[]>
  >;
  permitData: Permit[];
  businessHours: BusinessHours[];
  businessAmenities: BusinessAmenity[];
  setPermitData: React.Dispatch<React.SetStateAction<Permit[]>>;
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
  setData: React.Dispatch<React.SetStateAction<Business>>;
}

const StepContent: React.FC<{ step: number; commonProps: CommonProps }> = ({
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
      return (
        <Step3BusinessHours
          data={commonProps.data}
          businessHours={commonProps.businessHours}
          setBusinessHours={commonProps.setBusinessHours}
        />
      );
    case 4:
      return (
        <Step4ImageUpload
          data={commonProps.data}
          setData={commonProps.setData}
        />
      );
    case 5:
      return <Step4 {...commonProps} />;
    case 6:
      return <Step5 {...commonProps} />;
    default:
      return null;
  }
};

const BusinessRegistration: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const isSmall = useMediaQuery("(max-width: 1024px)");
  const [externalBookings, setExternalBookings] = useState<
    { name: string; link: string }[]
  >([]);

  const [formData, setFormData] = useState<Business>({
    id: "",
    business_image: "",
    business_name: "Kim Angela Homestay",
    phone_number: "09380417373",
    email: "kim@gmail.com",
    description: "This place is great",
    address: "123 Street, City",
    longitude: "",
    latitude: "",
    owner_id: user?.id ?? "",
    barangay_id: 0,
    status: "Pending",
    hasBooking: false,
    category_ids: [],
    primary_category_id: undefined,
  });

  const [registrationData, setRegistrationData] = useState<Registration>({
    id: "",
    business_id: "",
    status: "Pending",
    message: "",
    tourism_id: "",
  });

  const [addressData, setAddressData] = useState<Address>({
    barangay_id: 3,
    municipality_id: 24,
    province_id: 20,
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
    setExternalBookings([{ name: "", link: "" }]);
  }, [user]);

  if (!formData) return null;

  const commonProps = {
    data: formData,
    addressData,
    setAddressData,
    bookingSite: externalBookings,
    setBookingSites: setExternalBookings,
    permitData,
    businessHours,
    businessAmenities,
    setPermitData,
    setBusinessHours,
    setBusinessAmenities,
    setData: setFormData,
    setRegistrationData,
    registrationData,
  };

  const handleNext = () => {
    if (submitting) return; // avoid double submit
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
      setSubmitting(true);

      if (!formData.owner_id) {
        alert(
          "Owner profile is required before registering a business. Please complete your owner profile first."
        );
        throw new Error("Missing owner_id");
      }

      // 1️⃣ Insert Business
      const res = await apiClient.post(`/business`, {
        ...formData,
        barangay_id: addressData.barangay_id,
      });

      const businessId = res.data.id;
      console.log(businessId);

      // 2️⃣ Insert External Bookings (if any)
      if (externalBookings.length > 0) {
        await Promise.all(
          externalBookings.map((site) => {
            if (!site.name || !site.link) return null; // skip empty

            return apiClient.post(`/external-booking`, {
              business_id: businessId,
              name: site.name,
              link: site.link,
            });
          })
        );
      }

      if (businessHours.length > 0) {
        await Promise.all(
          businessHours.map((hours) =>
            apiClient.post(`/business-hours`, {
              business_id: businessId,
              day_of_week: hours.day_of_week,
              open_time: hours.open_time,
              close_time: hours.close_time,
              is_open: hours.is_open,
            })
          )
        );
      }

      if (businessAmenities.length > 0) {
        await Promise.all(
          businessAmenities.map((amenity) =>
            apiClient.post(`/business-amenities`, {
              business_id: businessId,
              amenity_id: amenity.amenity_id,
            })
          )
        );
      }

      if (permitData.length > 0) {
        await Promise.all(
          permitData.map((permit) =>
            apiClient.post(`/permit`, {
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

      // 1️⃣ Insert Business Registration
      const registration = await apiClient.post(`/registration`, {
        ...registrationData,
        business_id: businessId,
      });

      console.log("Registration response:", registration.data);

      console.log("✅ Business registration submitted successfully");
      navigate("/business");
    } catch (error) {
      console.error("❌ Failed to submit registration:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {/* Left: Hero image panel (hidden on small screens) */}
      {!isSmall && (
        <div
          style={{
            flex: 7, // ~35% width when paired with right's flex: 13
            position: "relative",
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(0.95)",
          }}
        >
          {/* Subtle overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.35) 100%)",
            }}
          />
        </div>
      )}

      {/* Right: Stepper form panel */}
      <div
        style={{
          flex: isSmall ? 1 : 13, // ~65% for the form on large screens
          display: "flex",
          flexDirection: "column",
          padding: isSmall ? "16px" : "24px 32px",
          backgroundColor: "#fff",
          width: "100%",
          minWidth: isSmall ? "auto" : 560,
          maxWidth: isSmall ? "100%" : 1200,
          marginLeft: "auto",
        }}
      >
        <PageContainer
          style={{
            width: "100%",
            margin: "0 auto",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            minHeight: 0,
          }}
        >
          {/* Header */}
          <div style={{ padding: "8px 12px", marginBottom: 8 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1.25}
            >
              <Stack direction="row" alignItems="center" gap={0.75}>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  aria-label="Go back"
                  onClick={handleBack}
                >
                  <ArrowBackRounded fontSize="small" />
                </IconButton>
              </Stack>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  marginLeft: 12,
                }}
              >
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Typography.Title size="normal">
                      Register your business
                    </Typography.Title>
                  </div>
                  <Typography.Body size="xs" sx={{ color: colors.gray }}>
                    A simple, step-by-step flow to get you listed.
                  </Typography.Body>
                </div>
              </div>

              <Stack alignItems="flex-end" gap={0.5}>
                <Typography.Body size="sm" sx={{ color: colors.gray }}>
                  Step {activeStep + 1} of {steps.length}
                </Typography.Body>
                <Box sx={{ width: 160, "--LinearProgress-thickness": "4px" }}>
                  <LinearProgress
                    determinate
                    value={Math.round(((activeStep + 1) / steps.length) * 100)}
                    variant="soft"
                    color="primary"
                  />
                </Box>
              </Stack>
            </Stack>
          </div>

          {/* Stepper overview removed for a cleaner, minimal header */}

          <Container
            elevation={0}
            className="br-section"
            style={{
              padding: 0,
              borderRadius: 0,
              border: "none",
              backgroundColor: "transparent",
              boxShadow: "none",
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
              minHeight: 0,
            }}
          >
            {/* Scoped form wrapper to apply compact, consistent spacing */}
            <div
              className="br-form-wrapper"
              style={{
                padding: "20px 24px 0px 24px",
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
              }}
            >
              <StepContent step={activeStep} commonProps={commonProps} />
            </div>

            {/* Buttons aligned with form content */}
            <div
              style={{
                padding: "24px 24px 20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                <Button
                  size="md"
                  variant="soft"
                  color="neutral"
                  onClick={handleBack}
                  aria-label="Back"
                  sx={{
                    minWidth: "100px",
                    fontWeight: 500,
                  }}
                >
                  Back
                </Button>
                <Button
                  size="md"
                  variant="solid"
                  color="primary"
                  onClick={handleNext}
                  loading={submitting && activeStep === steps.length - 1}
                  disabled={submitting}
                  aria-label={
                    activeStep === steps.length - 1
                      ? "Submit registration"
                      : "Next step"
                  }
                  sx={{
                    minWidth: "100px",
                    fontWeight: 500,
                  }}
                >
                  {activeStep === steps.length - 1 ? "Submit" : "Next"}
                </Button>
              </div>
            </div>
          </Container>
        </PageContainer>
      </div>
    </div>
  );
};

export default BusinessRegistration;
