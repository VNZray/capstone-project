import { Button, Box } from "@mui/joy";
import Typography from "../components/Typography";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { useAuth } from "../context/AuthContext";

const steps = [
  "Business Information",
  "Owner Information",
  "Address",
  "Business Permits",
  "Review & Submit",
];

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
  const { user } = useAuth(); // Get authenticated user
  const [submitting, setSubmitting] = useState(false);
  const [isExistingOwner, setIsExistingOwner] = useState(false);
  const [externalBookings, setExternalBookings] = useState<
    { name: string; link: string }[]
  >([]);

  // Check if user is already logged in (existing owner scenario)
  useEffect(() => {
    if (user && user.role_name === "Business Owner") {
      setIsExistingOwner(true);
      // Pre-fill user data from authenticated user
      setUserData({
        email: user.email || "",
        phone_number: user.phone_number || "",
        password: "", // Don't expose password
        barangay_id: Number(user.barangay_id) || 0,
        user_role_id: user.user_role_id,
        id: user.id,
      });
      // Try to fetch existing owner data
      fetchExistingOwnerData(user.id || "");
    }
  }, [user]);

  const fetchExistingOwnerData = async (userId: string) => {
    try {
      const response = await apiClient.get(`/owner/user/${userId}`);
      if (response.data) {
        setOwnerData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          middle_name: response.data.middle_name || "",
          age: response.data.age || "",
          birthdate: response.data.birthdate || "",
          gender: response.data.gender || "",
        });
        setFormData((prev) => ({ ...prev, owner_id: response.data.id }));
      }
    } catch (error) {
      console.log("No existing owner data found, will create new");
    }
  };

  const [userData, setUserData] = useState<User>({
    email: "",
    phone_number: "",
    password: "",
    barangay_id: 0,
    user_role_id: 4, // Business Owner role
  });

  const [ownerData, setOwnerData] = useState<Owner>({
    first_name: "",
    last_name: "",
    middle_name: "",
    age: "",
    birthdate: "",
    gender: "",
  });

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
    owner_id: "",
    category_ids: [],
    primary_category_id: undefined,
    barangay_id: 0,
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
      navigate("/"); // Go back to business list if on first step
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      let effectiveUserId = userData.id;
      let effectiveOwnerId = formData.owner_id;

      // SCENARIO 1: EXISTING OWNER (logged in user adding another business)
      if (isExistingOwner && user) {
        effectiveUserId = user.id || "";

        // If we already have owner_id from context, use it
        if (effectiveOwnerId) {
          console.log("✅ Using existing owner:", effectiveOwnerId);
        } else {
          // Try to find existing owner record
          try {
            const ownerRes = await apiClient.get(
              `/owner/user/${effectiveUserId}`
            );
            if (ownerRes.data && ownerRes.data.id) {
              effectiveOwnerId = ownerRes.data.id;
              console.log("✅ Found existing owner:", effectiveOwnerId);
            }
          } catch {
            // Owner doesn't exist yet, create one
            const ownerRes = await apiClient.post(`/owner`, {
              ...ownerData,
              user_id: effectiveUserId,
            });
            effectiveOwnerId = ownerRes?.data?.id;
            if (!effectiveOwnerId) throw new Error("Owner creation failed");
            console.log(
              "✅ Created new owner for existing user:",
              effectiveOwnerId
            );
          }
        }
      }
      // SCENARIO 2: NEW OWNER (public registration - create user account)
      else {
        // Check if user with this email already exists
        let userExists = false;
        try {
          const checkUser = await apiClient.get(
            `/users/email/${userData.email}`
          );
          if (checkUser.data) {
            userExists = true;
            effectiveUserId = checkUser.data.id;
            console.log("⚠️ User email already exists:", userData.email);
            alert(
              "An account with this email already exists. Please use a different email or log in first."
            );
            setSubmitting(false);
            return;
          }
        } catch {
          // User doesn't exist, proceed with creation
        }

        if (!userExists) {
          // Create new user account
          const userRes = await apiClient.post(`/users`, {
            ...userData,
            user_role_id: 4, // Business Owner role
          });
          effectiveUserId = userRes?.data?.id;
          if (!effectiveUserId) throw new Error("User creation failed");
          setUserData((prev) => ({ ...prev, id: effectiveUserId! }));
          console.log("✅ Created new user account:", effectiveUserId);

          // Send account credentials via email
          try {
            await sendAccountCredentials(
              userData.email,
              `${ownerData.first_name} ${ownerData.last_name}`,
              userData.email,
              userData.password || "defaultPassword123"
            );
            console.log("✅ Sent account credentials to:", userData.email);
          } catch (emailError) {
            console.error("⚠️ Failed to send credentials email:", emailError);
            // Don't fail the entire registration if email fails
          }
        }

        // Create owner record
        if (!effectiveOwnerId) {
          const ownerRes = await apiClient.post(`/owner`, {
            ...ownerData,
            user_id: effectiveUserId,
          });
          effectiveOwnerId = ownerRes?.data?.id;
          if (!effectiveOwnerId) throw new Error("Owner creation failed");
          setFormData((prev) => ({ ...prev, owner_id: effectiveOwnerId }));
          console.log("✅ Created new owner record:", effectiveOwnerId);
        }
      }

      // Insert Business
      const res = await apiClient.post(`/business`, {
        ...formData,
        owner_id: effectiveOwnerId,
        barangay_id: addressData.barangay_id || formData.barangay_id,
      });

      const businessId = res.data.id;
      console.log(businessId);

      // Insert External Bookings (if any)
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

      // Insert Business Registration
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        height: "100%",
        background: "#ffffff",
        overflow: "hidden",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: "100%", md: "320px" },
          minWidth: { xs: "100%", md: "320px" },
          height: { xs: "auto", md: "100%" },
          background: "linear-gradient(180deg, #0A1B47 0%, #0077B6 100%)",
          padding: { xs: "1.5rem 1rem", md: "2.5rem 1.5rem" },
          display: "flex",
          flexDirection: { xs: "row", md: "column" },
          gap: { xs: "1rem", md: "2rem" },
          alignItems: { xs: "center", md: "flex-start" },
          justifyContent: { xs: "space-between", md: "flex-start" },
          position: { xs: "sticky", md: "static" },
          top: 0,
          zIndex: 10,
          boxShadow: { xs: "0 2px 8px rgba(0,0,0,0.1)", md: "none" },
        }}
      >
        <Box>
          <Typography.Header
            sx={{
              color: "white",
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              mb: 0.5,
              fontWeight: 700,
            }}
          >
            Register
          </Typography.Header>
          <Typography.Body
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: { xs: "0.75rem", md: "0.875rem" },
              display: { xs: "none", sm: "block" },
            }}
          >
            {isExistingOwner ? "Add Your Business" : "Create Your Account"}
          </Typography.Body>
        </Box>

        {/* Mobile Step Progress Indicator */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {steps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: index === activeStep ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background:
                  index < activeStep
                    ? "#28a745"
                    : index === activeStep
                    ? "white"
                    : "rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
          <Typography.Body
            sx={{
              color: "white",
              fontSize: "0.75rem",
              fontWeight: 600,
              ml: 0.5,
            }}
          >
            {activeStep + 1}/{steps.length}
          </Typography.Body>
        </Box>

        {/* Desktop Vertical Stepper */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {/* Step Circle */}
                <Box
                  sx={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: isCompleted
                      ? "#28a745"
                      : isActive
                      ? "white"
                      : "rgba(255, 255, 255, 0.15)",
                    border: isActive
                      ? "3px solid rgba(255, 255, 255, 0.5)"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isActive ? "#0A1B47" : "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? "✓" : index + 1}
                </Box>

                {/* Step Label */}
                <Box sx={{ flex: 1 }}>
                  <Typography.Body
                    sx={{
                      color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "0.875rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {step}
                  </Typography.Body>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          padding: { xs: "2rem 1rem", sm: "2.5rem 2rem", md: "3rem 4rem" },
          overflowY: "auto",
          height: { xs: "auto", md: "100vh" },
          background: "#fafafa",
        }}
      >
        {renderStepContent(activeStep)}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: "1rem", sm: 0 },
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "2px solid #e5e7eb",
            background: "white",
            marginX: { xs: "-1rem", sm: "-2rem", md: "-4rem" },
            marginBottom: { xs: "-2rem", md: "-3rem" },
            paddingX: { xs: "1rem", sm: "2rem", md: "4rem" },
            paddingBottom: "2rem",
          }}
        >
          <Button
            size="lg"
            variant="outlined"
            color="neutral"
            onClick={handleBack}
            aria-label="Back"
            sx={{
              minWidth: { xs: "100%", sm: "120px" },
              fontWeight: 600,
              borderRadius: "10px",
              borderWidth: "2px",
              borderColor: "#0A1B47",
              color: "#0A1B47",
              "&:hover": {
                borderWidth: "2px",
                borderColor: "#0077B6",
                background: "rgba(0, 119, 182, 0.05)",
              },
            }}
          >
            Back
          </Button>
          <Button
            size="lg"
            variant="solid"
            onClick={handleNext}
            loading={submitting && activeStep === steps.length - 1}
            disabled={submitting}
            aria-label={
              activeStep === steps.length - 1
                ? "Submit registration"
                : "Next step"
            }
            sx={{
              minWidth: { xs: "100%", sm: "120px" },
              fontWeight: 600,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0A1B47 0%, #0077B6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #0077B6 0%, #0A1B47 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(0, 119, 182, 0.3)",
              },
            }}
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessRegistration;
