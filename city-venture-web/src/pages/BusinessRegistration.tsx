import { Box } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowBack } from "@mui/icons-material";
import { CheckCircle } from "lucide-react";
import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Typography from "../components/Typography";
import Alert from "../components/Alert";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import type { Business, BusinessHours, Registration } from "../types/Business";
import type { Address } from "../types/Address";
import type { Permit } from "../types/Permit";
import type { BusinessAmenity } from "../types/Amenity";
import apiClient from "../services/apiClient";
import type { Owner } from "../types/Owner";
import type { User } from "../types/User";
import {
  initializeEmailJS,
  sendAccountCredentials,
} from "../services/email/EmailService";
import { colors } from "../utils/Colors";
import Container from "../components/Container";

const steps = [
  "Business Information",
  "Owner Information",
  "Address",
  "Business Permits",
  "Review & Submit",
];

import bg from "@/src/assets/gridimages/grid5.jpg";

// Props passed down to each step component
type CommonProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
  userData: User;
  setUserData: React.Dispatch<React.SetStateAction<User>>;
  ownerData: Owner;
  setOwnerData: React.Dispatch<React.SetStateAction<Owner>>;
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
};

const BusinessRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [externalBookings, setExternalBookings] = useState<
    { name: string; link: string }[]
  >([]);
  const [alert, setAlert] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ open: false, type: "info", title: "", message: "" });

  const [userData, setUserData] = useState<User>({
    email: "sample.business@gmail.com",
    phone_number: "09123456789",
    password: "SamplePass123!",
    barangay_id: 3,
    user_role_id: 4,
  });

  const [ownerData, setOwnerData] = useState<Owner>({
    first_name: "Maria",
    last_name: "Santos",
    middle_name: "Cruz",
    age: "35",
    birthdate: "1989-05-15",
    gender: "Female",
  });

  const [formData, setFormData] = useState<Business>({
    id: "",
    business_image: "",
    business_name: "Sample Restaurant & Café",
    phone_number: "09171234567",
    email: "contact@samplerestaurant.com",
    description:
      "A cozy family-friendly restaurant offering authentic Filipino cuisine and specialty coffee. We pride ourselves on using fresh local ingredients and providing excellent service in a warm, welcoming atmosphere.",
    address: "123 Main Street, Corner Rizal Avenue, Barangay Centro",
    longitude: "121.0244",
    latitude: "14.5547",
    owner_id: "",
    category_ids: [],
    primary_category_id: undefined,
    barangay_id: 3,
    status: "Pending",
    hasBooking: false,
  });

  const [registrationData] = useState<Registration>({
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

  // Initialize EmailJS
  useEffect(() => {
    initializeEmailJS();
  }, []);

  if (!formData) return null;

  const validateStep = (step: number): boolean => {
    let errorMessage = "";

    switch (step) {
      case 0: // Business Information
        if (!formData.business_name?.trim()) {
          errorMessage = "Please enter business name";
        } else if (!formData.phone_number?.trim()) {
          errorMessage = "Please enter phone number";
        } else if (!formData.email?.trim()) {
          errorMessage = "Please enter email";
        } else if (
          !formData.category_ids ||
          formData.category_ids.length === 0
        ) {
          errorMessage = "Please select at least one category";
        }
        break;
      case 1: // Owner Information
        if (!ownerData.first_name?.trim()) {
          errorMessage = "Please enter first name";
        } else if (!ownerData.last_name?.trim()) {
          errorMessage = "Please enter last name";
        } else if (!userData.email?.trim()) {
          errorMessage = "Please enter email";
        } else if (!userData.password?.trim()) {
          errorMessage = "Please enter password";
        }
        break;
      case 2: // Address
        if (!addressData.barangay_id) {
          errorMessage = "Please select barangay";
        } else if (!formData.address?.trim()) {
          errorMessage = "Please enter address";
        }
        break;
      case 3: // Permits
        if (permitData.length === 0) {
          errorMessage =
            "Please upload at least one permit (Business Permit or Mayor's Permit)";
        } else {
          const permitsWithoutExpiration = permitData.filter(
            (permit) => !permit.expiration_date
          );
          if (permitsWithoutExpiration.length > 0) {
            errorMessage = "Please provide expiration dates for all permits";
          }
        }
        break;
    }

    if (errorMessage) {
      setAlert({
        open: true,
        type: "warning",
        title: "Validation Error",
        message: errorMessage,
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (submitting) return; // avoid double submit

    // Validate current step before proceeding
    if (!validateStep(activeStep)) {
      return;
    }

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
      navigate("/"); // Go back to business list if on first step
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate permits before submission
      if (permitData.length === 0) {
        setAlert({
          open: true,
          type: "warning",
          title: "Missing Permits",
          message: "Please upload at least one permit before submitting",
        });
        return;
      }

      const permitsWithoutExpiration = permitData.filter(
        (permit) => !permit.expiration_date
      );
      if (permitsWithoutExpiration.length > 0) {
        setAlert({
          open: true,
          type: "warning",
          title: "Missing Expiration Dates",
          message: "All permits must have expiration dates",
        });
        return;
      }

      // Create User first if needed (endpoint: /api/users)
      let effectiveUserId = userData.id;
      if (!effectiveUserId) {
        const userRes = await apiClient.post(`/users`, {
          ...userData,
        });
        effectiveUserId = userRes?.data?.id;
        if (!effectiveUserId) {
          throw new Error(
            "Failed to create user account. Please check your email and try again."
          );
        }
        // keep state in sync for any subsequent steps
        setUserData((prev) => ({ ...prev, id: effectiveUserId! }));

        // Send account credentials via email
        try {
          await sendAccountCredentials(
            userData.email,
            `${ownerData.first_name} ${ownerData.last_name}`,
            userData.email,
            userData.password || "owner123"
          );
        } catch (emailError) {
          console.error("Failed to send credentials email:", emailError);
          // Don't fail the whole registration if email fails
        }
      }

      // If no owner created yet, create it now from Step 2 data
      let effectiveOwnerId = formData.owner_id;
      if (!effectiveOwnerId) {
        const ownerRes = await apiClient.post(`/owner`, {
          ...ownerData,
          user_id: effectiveUserId,
        });
        const ownerId = ownerRes?.data?.id;
        if (!ownerId) {
          throw new Error("Failed to create owner profile. Please try again.");
        }
        effectiveOwnerId = ownerId;
        // set for subsequent UI uses
        setFormData((prev) => ({ ...prev, owner_id: ownerId }));
      }

      // Insert Business
      const res = await apiClient.post(`/business`, {
        ...formData,
        owner_id: effectiveOwnerId,
        barangay_id: addressData.barangay_id || formData.barangay_id,
      });

      const businessId = res.data.id;
      if (!businessId) {
        throw new Error("Failed to create business. Please try again.");
      }
      console.log("Business created with ID:", businessId);

      // Insert External Bookings (if any)
      if (externalBookings.length > 0) {
        try {
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
        } catch (bookingError) {
          console.error("Failed to save external bookings:", bookingError);
          // Continue with registration even if external bookings fail
        }
      }

      // Insert Business Hours
      if (businessHours.length > 0) {
        try {
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
        } catch (hoursError) {
          console.error("Failed to save business hours:", hoursError);
          // Continue with registration
        }
      }

      // Insert Business Amenities
      if (businessAmenities.length > 0) {
        try {
          await Promise.all(
            businessAmenities.map((amenity) =>
              apiClient.post(`/business-amenities`, {
                business_id: businessId,
                amenity_id: amenity.amenity_id,
              })
            )
          );
        } catch (amenityError) {
          console.error("Failed to save amenities:", amenityError);
          // Continue with registration
        }
      }

      // Insert Permits - THIS IS CRITICAL, must succeed
      if (permitData.length > 0) {
        try {
          await Promise.all(
            permitData.map((permit) => {
              if (!permit.file_url || !permit.permit_type) {
                throw new Error(`Invalid permit data: ${permit.permit_type}`);
              }
              return apiClient.post(`/permit`, {
                business_id: businessId,
                permit_type: permit.permit_type,
                file_url: permit.file_url,
                file_format: permit.file_format,
                file_size: permit.file_size,
                file_name: permit.file_name,
                status: permit.status || "pending",
                expiration_date: permit.expiration_date,
              });
            })
          );
          console.log("✅ Permits saved successfully");
        } catch (permitError) {
          console.error("❌ Failed to save permits:", permitError);
          throw new Error(
            "Failed to upload permits. Please ensure all permits are properly uploaded with expiration dates."
          );
        }
      } else {
        throw new Error(
          "At least one permit is required to complete registration."
        );
      }

      // Insert Business Registration
      const registration = await apiClient.post(`/registration`, {
        ...registrationData,
        business_id: businessId,
      });

      if (!registration.data) {
        throw new Error("Failed to create registration record");
      }

      console.log("✅ Business registration submitted successfully");

      setAlert({
        open: true,
        type: "success",
        title: "Registration Successful!",
        message:
          "Your business registration has been submitted successfully. You will be notified once your application is reviewed.",
      });

      setTimeout(() => {
        navigate("/business");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Failed to submit registration:", error);

      const errorMessage =
        error.message || "Something went wrong. Please try again.";

      setAlert({
        open: true,
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const commonProps: CommonProps = {
    data: formData,
    addressData,
    setAddressData,
    userData,
    setUserData,
    ownerData,
    setOwnerData,
    bookingSite: externalBookings,
    setBookingSites: setExternalBookings,
    permitData,
    businessHours,
    businessAmenities,
    setPermitData,
    setBusinessHours,
    setBusinessAmenities,
    setData: setFormData,
  };

  const renderStepContent = (step: number) => {
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
      default:
        return null;
    }
  };

  return (
    <>
      <Alert
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={false}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "50% 50%" },
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Left Section - Static Info */}
        <Box
          sx={{
            position: { xs: "relative", md: "sticky" },
            top: 0,
            height: { xs: "auto", md: "100vh" },
            backgroundImage: `url('${bg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: colors.white,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.primary,
              opacity: 0.7,
              zIndex: 1,
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 2, width: "100%" }}>
            <Container gap="0" padding="40px">
              <Typography.Title
                sx={{
                  color: colors.white,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Register Your Business
              </Typography.Title>
              <Typography.Body
                sx={{
                  color: colors.tertiary,
                  mb: 4,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                }}
              >
                A simple, step-by-step process to get you listed
              </Typography.Body>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: colors.secondary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={16} color={colors.white} />
                  </Box>
                  <Typography.Body sx={{ color: colors.tertiary }}>
                    Fast & secure process
                  </Typography.Body>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: colors.secondary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={16} color={colors.white} />
                  </Box>
                  <Typography.Body sx={{ color: colors.tertiary }}>
                    Save and resume anytime
                  </Typography.Body>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: colors.secondary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={16} color={colors.white} />
                  </Box>
                  <Typography.Body sx={{ color: colors.tertiary }}>
                    Complete in under 10 minutes
                  </Typography.Body>
                </Box>
              </Box>
            </Container>
          </Box>
        </Box>

        {/* Right Section - Form Content */}
        <Box
          sx={{
            backgroundColor: colors.background,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Fixed Header - Back Arrow & Step Progress */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: colors.background,
              borderBottom: `1px solid ${colors.tertiary}`,
              p: { xs: 2, md: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <IconButton
                variant="plain"
                onClick={handleBack}
                sx={{ color: colors.gray }}
              >
                <ArrowBack />
              </IconButton>
              <Typography.Label sx={{ color: colors.gray }}>
                Step {activeStep + 1} of {steps.length}
              </Typography.Label>
            </Box>

            {/* Progress Bar */}
            <Box
              sx={{
                width: "100%",
                height: "4px",
                backgroundColor: colors.tertiary,
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${((activeStep + 1) / steps.length) * 100}%`,
                  height: "100%",
                  backgroundColor: colors.secondary,
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </Box>
          </Box>

          {/* Scrollable Form Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: { xs: 3, md: 4 },
            }}
          >
            {renderStepContent(activeStep)}
          </Box>

          {/* Fixed Bottom Navigation */}
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              zIndex: 10,
              backgroundColor: colors.white,
              borderTop: `1px solid ${colors.tertiary}`,
              boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
              p: { xs: 2, md: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
              }}
            >
              <Button
                size="lg"
                variant="outlined"
                colorScheme="secondary"
                onClick={handleBack}
                sx={{
                  flex: 1,
                  maxWidth: { xs: "none", md: "150px" },
                }}
              >
                Back
              </Button>
              <Button
                size="lg"
                variant="solid"
                colorScheme="primary"
                onClick={handleNext}
                loading={submitting && activeStep === steps.length - 1}
                disabled={submitting}
                sx={{
                  flex: 1,
                  maxWidth: { xs: "none", md: "150px" },
                }}
              >
                {activeStep === steps.length - 1
                  ? "Submit Registration"
                  : "Next"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default BusinessRegistration;
